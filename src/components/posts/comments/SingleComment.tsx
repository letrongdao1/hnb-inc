"use client";

import { PostComment } from "@/interfaces/news";
import { CommonUtils } from "@/utils/common.utils";
import { Avatar, Button, Image, Textarea, Tooltip } from "@heroui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CommentInput from "./CommentInput";
import { motion, AnimatePresence } from "framer-motion";
import { STATUS_CODE } from "@/constants/enums";
import { REACT_IMAGE_SRC } from "@/constants/constants";
import { useUser } from "@/providers/user.provider";

type SingleCommentProps = {
  comment: PostComment;
  hideReply?: boolean;
  replyCallback?: (newComment: PostComment) => void;
};

export default function CommentTree({ comment }: { comment: PostComment }) {
  const [childCommentList, setChildCommentList] = useState<PostComment[]>(comment.children || []);

  const handleAddNewComment = (newComment: PostComment) => {
    setChildCommentList((prev) => [newComment, ...prev]);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <SingleComment comment={comment} replyCallback={handleAddNewComment} />

      <div className="flex max-h-96 flex-col gap-2 self-stretch overflow-y-auto">
        {childCommentList.map((child) => (
          <div key={child.id} className="pl-8 md:pl-16">
            <SingleComment comment={child} hideReply />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SingleComment({ comment, hideReply, replyCallback }: SingleCommentProps) {
  const { user } = useUser();
  const [currentLike, setCurrentLike] = useState<number>(comment.like_count);
  const [currentDislike, setCurrentDislike] = useState<number>(comment.dislike_count);
  const [isShowReply, setIsShowReply] = useState<boolean>(false);
  const [replyInput, setReplyInput] = useState<string>("");

  const incrementLikeRef = useRef<number>(0);
  const incrementDislikeRef = useRef<number>(0);
  const debounceLikeRef = useRef<NodeJS.Timeout | null>(null);
  const debounceDislikeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentLike(comment.like_count);
    setCurrentDislike(comment.dislike_count);
  }, [comment]);

  const handleUpdateReaction = useCallback(
    async (reaction_type: "like" | "dislike") => {
      if (
        (reaction_type === "like" && incrementLikeRef.current === 0) ||
        (reaction_type === "dislike" && incrementDislikeRef.current === 0)
      )
        return;

      await fetch("/api/posts/comments/reaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: comment.id,
          commentUserId: comment.user.id,
          commentContent: comment.content,
          postSlug: comment.post.slug,
          reaction_type,
          increment:
            reaction_type === "like" ? incrementLikeRef.current : incrementDislikeRef.current,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            if (reaction_type === "like") incrementLikeRef.current = 0;
            else incrementDislikeRef.current = 0;
          }
        });
    },
    [comment]
  );

  const handleIncrementLike = () => {
    if (user && comment.user.id === user.id) return;

    incrementLikeRef.current += 1;

    setCurrentLike((prev) => {
      const newCount = prev + 1;

      if (debounceLikeRef.current) clearTimeout(debounceLikeRef.current);

      debounceLikeRef.current = setTimeout(() => {
        handleUpdateReaction("like");
      }, 3000);

      return newCount;
    });
  };

  const handleIncrementDislike = () => {
    if (user && comment.user.id === user.id) return;

    incrementDislikeRef.current += 1;

    setCurrentDislike((prev) => {
      const newCount = prev + 1;

      if (debounceDislikeRef.current) clearTimeout(debounceDislikeRef.current);

      debounceDislikeRef.current = setTimeout(() => {
        handleUpdateReaction("dislike");
      }, 3000);

      return newCount;
    });
  };

  return (
    <div className="flex w-full items-start gap-3">
      <Avatar src={comment.user.avatar} alt="" className="shrink-0" />

      <div className="my-auto flex flex-1 flex-col items-stretch gap-2">
        <div>
          <p className="font-semibold">{comment.user.display_name}</p>
          <p className="text-sm">{comment.content}</p>
        </div>

        <span className="flex w-full items-center justify-start gap-2 md:gap-4">
          <Tooltip
            content={
              <div className="flex items-center gap-1">
                <time dateTime={comment.created_at}>
                  {new Date(comment.created_at).toLocaleDateString("vi", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  &ensp;
                  {new Date(comment.created_at).toLocaleTimeString("en", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </time>
              </div>
            }
          >
            <p className="text-tiny font-light opacity-75">
              {CommonUtils.getTimeComparedToNow(comment.created_at, true)}
            </p>
          </Tooltip>

          {!hideReply && (
            <>
              &middot;
              <button
                onClick={() => {
                  setIsShowReply((prev) => !prev);
                }}
                className="text-tiny py-2"
              >
                Trả lời
              </button>
            </>
          )}
          {(comment.user.id !== user?.id || currentLike + currentDislike > 0) && (
            <span className="flex items-center justify-start gap-2">
              <Button
                isIconOnly
                size="sm"
                variant={currentLike > 0 && comment.user.id !== user?.id ? "solid" : "light"}
                color={currentLike > 0 && comment.user.id !== user?.id ? "success" : "default"}
                startContent={
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Image
                      src={REACT_IMAGE_SRC.like}
                      alt=""
                      width={24}
                      height={20}
                      radius="none"
                      className="rounded-xs"
                    />
                    {currentLike || ""}
                  </div>
                }
                onPress={handleIncrementLike}
                className="min-w-fit px-2"
              />
              <Button
                isIconOnly
                size="sm"
                variant={currentDislike > 0 && comment.user.id !== user?.id ? "solid" : "light"}
                color={currentDislike > 0 && comment.user.id !== user?.id ? "danger" : "default"}
                startContent={
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Image
                      src={REACT_IMAGE_SRC.dislike}
                      alt=""
                      width={24}
                      height={20}
                      radius="none"
                      className="rounded-xs"
                    />
                    {currentDislike || ""}
                  </div>
                }
                onPress={handleIncrementDislike}
                className="min-w-fit px-2"
              />
              {currentLike === 0 && currentDislike === 0 && (
                <p className="text-tiny hidden min-w-fit opacity-50 md:inline">
                  Nhấn (liên tục) để biểu cảm
                </p>
              )}
            </span>
          )}
        </span>

        <AnimatePresence mode="wait">
          {isShowReply && (
            <motion.div
              key="reply-box"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <CommentInput
                value={replyInput}
                setValue={setReplyInput}
                post={comment.post}
                placeholder={`Trả lời ${comment.user.display_name}...`}
                toReplyComment={comment}
                callback={replyCallback}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
