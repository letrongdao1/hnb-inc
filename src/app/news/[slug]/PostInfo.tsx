"use client";

import EmptyComponent from "@/components/empty/empty";
import HoverableUser from "@/components/hoverable-user/hoverable-user";
import CommentInput from "@/components/posts/comments/CommentInput";
import CommentTree from "@/components/posts/comments/SingleComment";
import { ArrowLeftIcon } from "@/components/svg";
import { PageTitle, SectionTitle } from "@/components/ui/text";
import type { PostComment, PostInfo } from "@/interfaces/news";
import { createClient } from "@/lib/supabase/client";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
  ScrollShadow,
  Spacer,
} from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const supabase = createClient();

export default function PostInfoPage({ post }: { post: PostInfo | null }) {
  const router = useRouter();

  const [currentCommentList, setCurrentCommentList] = useState<PostComment[]>(
    post?.commentList || []
  );

  const [commentInput, setCommentInput] = useState<string>("");

  useEffect(() => {
    if (!post) return;

    const channel = supabase
      .channel("realtime-post_comments")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "post_comments",
          filter: `post=eq.${post.id}`,
        },
        (payload) => {
          const updatedComment = payload.new as PostComment;
          setCurrentCommentList((prev) =>
            prev.map((comment) =>
              comment.id === updatedComment.id
                ? {
                    ...comment,
                    like_count: updatedComment.like_count,
                    dislike_count: updatedComment.dislike_count,
                  }
                : comment
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post]);

  const handleAddNewComment = (newComment: PostComment) => {
    setCurrentCommentList((prev) => [newComment, ...prev]);
  };

  if (!post)
    return (
      <EmptyComponent
        title="Không tìm thấy bài viết"
        description=""
        button={
          <Button
            onPress={() => router.replace("/news")}
            startContent={<ArrowLeftIcon />}
            variant="flat"
            className="text-inherit"
          >
            Trở về bảng tin
          </Button>
        }
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto flex w-full items-start justify-center p-2 md:p-4"
    >
      <ScrollShadow className="w-full">
        <Card
          isBlurred
          className="border-default-100 bg-background/60 w-full shadow-lg backdrop-blur-lg"
          radius="lg"
        >
          {post.image && (
            <CardHeader className="relative w-full p-0">
              <motion.div transition={{ duration: 0.4 }} className="w-full p-2">
                <Image
                  removeWrapper
                  src={post.image}
                  alt={post.title}
                  className={`mx-auto max-h-[20vh] w-full rounded-2xl object-cover md:max-h-[30vh] md:max-w-2/3`}
                />
              </motion.div>
            </CardHeader>
          )}

          <CardBody className="flex flex-col items-stretch gap-4 md:p-6">
            <div className="flex-1 text-center">
              <PageTitle>{post.title}</PageTitle>
            </div>

            <Divider className="my-4" />

            {post.content && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="prose prose-neutral dark:prose-invert min-h-64 max-w-none text-start leading-relaxed"
              >
                <pre className="font-sans break-words whitespace-pre-wrap">
                  {renderContentWithMentions(post.content)}
                </pre>
              </motion.div>
            )}

            <p className="text-default-400 ml-auto text-xs italic">Thông tin đến HNB</p>

            <Spacer y={8} />

            <div className="flex flex-col items-stretch justify-start gap-2">
              <SectionTitle>Bình luận</SectionTitle>

              <CommentInput
                value={commentInput}
                setValue={setCommentInput}
                post={post}
                callback={handleAddNewComment}
              />

              <Divider className="my-2" />

              {!currentCommentList || !currentCommentList.length ? (
                <EmptyComponent imageSize={100} margin={20} title={"Chưa có bình luận "} />
              ) : (
                <div className="flex flex-col items-stretch gap-2">
                  {currentCommentList.map((comment) => (
                    <CommentTree key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
            </div>
          </CardBody>

          <CardFooter className="text-default-400 flex flex-col items-end gap-2 px-6 py-4 text-xs italic">
            <Divider className="my-4" />

            <div className="md:ml-auto">
              <p className="text-default-400 ml-auto flex flex-col items-center gap-2 text-xs md:flex-row">
                <span className="flex items-center gap-2">
                  Đăng bởi <HoverableUser user={post.user} />
                </span>
                <time dateTime={post.active_at}>
                  {new Date(post.active_at).toLocaleDateString("vi", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </p>
            </div>
          </CardFooter>
        </Card>
      </ScrollShadow>
    </motion.div>
  );
}

export const renderContentWithMentions = (content: string) => {
  return content.split(/(@\[.*?\]\(id:.*?\))/g).map((part, i) => {
    const match = part.match(/@\[(.*?)\]\(id:(.*?)\)/);
    if (match) {
      const [, display, id] = match;
      return (
        <p key={i} className="inline font-semibold text-cyan-600 hover:underline">
          @{display}
        </p>
      );
    }
    return <span key={i}>{part}</span>;
  });
};
