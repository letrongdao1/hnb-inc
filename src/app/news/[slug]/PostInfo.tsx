"use client";

import EmptyComponent from "@/components/empty/empty";
import HoverableUser from "@/components/hoverable-user/hoverable-user";
import { ArrowLeftIcon } from "@/components/svg";
import { PageTitle } from "@/components/ui/text/text";
import type { PostInfo } from "@/interfaces/news";
import { CommonUtils } from "@/utils/common.utils";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
  ScrollShadow,
} from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PostInfoPage({ post }: { post: PostInfo }) {
  const router = useRouter();

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

  // const mentions = CommonUtils.parseMentions(post.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto flex w-full items-start justify-center p-4"
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
                  className={`h-full w-full rounded-none object-cover`}
                />
              </motion.div>
            </CardHeader>
          )}

          <CardBody className="flex flex-col items-stretch gap-4 p-6">
            <div className="flex items-start justify-center gap-2">
              <div className="hidden md:inline">
                <Button
                  variant="light"
                  onPress={() => router.replace("/news")}
                  startContent={<ArrowLeftIcon />}
                  className="w-fit border-none text-inherit"
                ></Button>
              </div>
              <div className="flex-1 text-center">
                <PageTitle>{post.title}</PageTitle>
              </div>
              <div className="hidden md:inline" />
            </div>

            <div className="ml-auto">
              <p className="text-default-400 ml-auto flex items-center gap-2 text-xs">
                Đăng bởi <HoverableUser user={post.user} />•
                <time dateTime={post.active_at}>
                  {new Date(post.active_at).toLocaleDateString("vi", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </p>
            </div>

            <Divider className="my-4" />

            {post.content && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="prose prose-neutral dark:prose-invert min-h-64 max-w-none text-start leading-relaxed"
              >
                {renderContentWithMentions(post.content)}
              </motion.div>
            )}
          </CardBody>

          <CardFooter className="text-default-400 flex justify-end px-6 py-4 text-xs italic">
            <p>Thông tin đến HNB</p>
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
        <p key={i} className="inline font-semibold text-sky-600 hover:underline">
          @{display}
        </p>
      );
    }
    return <span key={i}>{part}</span>;
  });
};
