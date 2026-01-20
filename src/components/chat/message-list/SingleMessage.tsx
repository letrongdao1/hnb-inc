"use client";

import { ChatMessage, ChatMessageStatusEnum, ChatMessageTypeEnum } from "@/interfaces/chat";
import { ChatUtils } from "@/utils/chat.utils";
import { Avatar, Image, Spinner } from "@heroui/react";
import dayjs from "dayjs";
import React from "react";

type SingleMessageProps = {
  message: ChatMessage;
  isTopMessage: boolean;
};

export default function SingleMessage({ message, isTopMessage }: SingleMessageProps) {
  const renderMessageContent = () => {
    switch (message.type) {
      case ChatMessageTypeEnum.TEXT:
        return (
          <span className={`hover:bg-default-100 shrink rounded-xl duration-200`}>
            <p className="text-wrap">{message.content}</p>
          </span>
        );
      case ChatMessageTypeEnum.IMAGE:
        return (
          <span className={`shrink space-y-1 overflow-hidden rounded-xl`}>
            <p className="text-wrap">{message.content}</p>
            {message.attachment_url ? (
              <Image
                src={message.attachment_url}
                alt=""
                loading="lazy"
                className="h-40 w-auto max-w-full object-contain md:h-64"
              />
            ) : (
              <div className="bg-default-100 group-hover:bg-default-50 flex aspect-square h-40 items-center justify-center rounded-md md:h-64">
                <Spinner color="current" variant="gradient" size="sm" />
              </div>
            )}
          </span>
        );
    }
  };
  if (message.sender)
    return (
      <div
        className={`hover:bg-default-100 group flex items-stretch justify-start gap-1 py-1 pl-2 duration-200`}
      >
        <div className="flex shrink-0 items-start">
          {isTopMessage ? (
            <span className="flex w-[50px] items-center justify-center">
              <Avatar src={message.sender?.avatar} alt="" className="shrink-0" />
            </span>
          ) : (
            <p className="text-default-400 invisible w-[50px] pt-1 text-[0.6em] group-hover:visible">
              {dayjs(message.created_at).format("HH:mm A")}
            </p>
          )}
        </div>

        <div className="flex flex-col items-stretch justify-start gap-1">
          {isTopMessage && (
            <span className="flex items-center gap-2">
              <p className="font-semibold">{message.sender?.display_name}</p>
              <p className="text-default-400 text-xs">
                {ChatUtils.getMessageTimeDisplay(message.created_at)}
              </p>
            </span>
          )}

          <div
            className={`w-full text-sm ${message.status !== ChatMessageStatusEnum.SENT && "opacity-50"}`}
          >
            {renderMessageContent()}
          </div>
        </div>
      </div>
    );

  if (message.type === ChatMessageTypeEnum.SYSTEM)
    return (
      <div className="p-1 text-center">
        <p className="text-default-500 text-sm font-light">{message.metadata?.title}</p>
      </div>
    );
}
