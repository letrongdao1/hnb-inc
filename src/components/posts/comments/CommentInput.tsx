"use client";

import { SendIcon } from "@/components/svg";
import { STATUS_CODE, SYSTEM_MESSAGE } from "@/constants/enums";
import { PostComment } from "@/interfaces/news";
import { useUser } from "@/providers/user.provider";
import { addToast, Avatar, Button, Textarea } from "@heroui/react";
import React, { useMemo, useRef, useState } from "react";

type CommentInputProps = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  postId: string;
  toReplyComment?: PostComment;
  maxLength?: number;
  placeholder?: string;
  callback?: (newComment: PostComment) => void;
};

export default function CommentInput({
  value,
  setValue,
  postId,
  toReplyComment,
  placeholder = "Bình luận bản tin...",
  maxLength = 5000,
  callback,
}: CommentInputProps) {
  const { user } = useUser();

  const [isSending, setIsSending] = useState<boolean>(false);

  const sendRef = useRef<HTMLButtonElement>(null);

  const isCommentError = useMemo(() => maxLength && value.length > maxLength, [value, maxLength]);

  const handleSend = async () => {
    const newComment = {
      post: postId,
      content: value,
      parent_id: toReplyComment ? toReplyComment.id : undefined,
    };

    setIsSending(true);
    await fetch("/api/posts/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newComment),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.CREATED) {
          setValue("");
          if (!result.data) return console.log({ result });

          callback?.(result.data);
        } else throw new Error(result.message);
      })
      .catch((err) => {
        addToast({
          title: err.message || SYSTEM_MESSAGE.SYSTEM_ERROR,
          color: "danger",
        });
      })
      .finally(() => setIsSending(false));
  };

  return (
    <span className={`flex items-start justify-start gap-2 ${isSending && "opacity-75"}`}>
      <Avatar src={user?.avatar} alt="" size="sm" className="mt-1 shrink-0" />
      <Textarea
        value={value}
        onValueChange={setValue}
        placeholder={placeholder}
        isDisabled={isSending}
        minRows={1}
        maxRows={8}
        isInvalid={Boolean(isCommentError)}
        errorMessage={"Bình luận quá dài. Vui lòng sử dụng ngôn từ ngắn gọn, xúc xích 🌭"}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.altKey) {
              const { selectionStart, selectionEnd } = e.currentTarget;
              const newValue =
                value.substring(0, selectionStart) + "\n" + value.substring(selectionEnd);
              setValue(newValue);

              requestAnimationFrame(() => {
                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = selectionStart + 1;
              });
            } else {
              e.preventDefault();
              sendRef.current?.click();
            }
          }
        }}
        className="flex-1"
      />
      <Button
        ref={sendRef}
        isIconOnly
        variant="solid"
        color="primary"
        startContent={!isSending && <SendIcon size={16} />}
        isDisabled={!value.length}
        isLoading={isSending}
        onPress={handleSend}
        className="shrink-0"
      />
    </span>
  );
}
