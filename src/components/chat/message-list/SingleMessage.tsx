"use client";

import { ChatMessage, ChatMessageTypeEnum } from "@/interfaces/chat";
import { Avatar, Chip, Image } from "@heroui/react";
import React from "react";

type SingleMessageProps = {
  message: ChatMessage;
};

export default function SingleMessage({ message }: SingleMessageProps) {
  const isMine = message.is_mine;

  const renderMessageContent = () => {
    switch (message.type) {
      case ChatMessageTypeEnum.TEXT:
        return (
          <span className={`${isMine ? "bg-primary-300" : "bg-default-100"} shrink rounded-xl p-2`}>
            <p className="text-wrap">{message.content}</p>
          </span>
        );
      case ChatMessageTypeEnum.IMAGE:
        <span className={`${isMine ? "bg-primary-300" : "bg-default-100"} shrink rounded-xl p-2`}>
          <p className="text-wrap">{message.content}</p>
          {message.attachment_url && (
            <Image src={message.attachment_url} alt="" className="object-cover" />
          )}
        </span>;
      case ChatMessageTypeEnum.SYSTEM:
    }
  };
  return (
    <div className={`flex items-stretch gap-1`}>
      <span className={`shrink rounded-xl`}>
        <p className="text-wrap">{message.content}</p>
      </span>
    </div>
  );
}
