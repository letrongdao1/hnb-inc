"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useMemo, useRef } from "react";
import { useChatStore } from "@/stores/chat.store";
import { LoaderIcon } from "@/components/loader";
import SingleMessage from "./SingleMessage";
import { ChatMessage } from "@/interfaces/chat";
import { BaseUserInfo } from "@/interfaces/user";
import { Avatar } from "@heroui/react";
import dayjs from "dayjs";
import { SPLIT_IMAGE_INTERVAL } from "@/constants/constants";

type ChatGroupedMessage = {
  senderId?: string;
  sender?: BaseUserInfo;
  sentAt: Date;
  messages: ChatMessage[];
};

export default function ChatMessageList() {
  const { messages, fetchMessages, hasMore } = useChatStore();

  const groupedMessageList = useMemo(() => groupMessagesByUser(messages), [messages]);

  console.log({ groupedMessageList });

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <>
      <div
        id="chat-scroll-container"
        style={{
          overflowY: "auto",
          height: "100vh",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMessages}
          hasMore={hasMore}
          inverse={true}
          loader={
            <p className="flex items-center justify-center py-2">
              <LoaderIcon />
            </p>
          }
          scrollableTarget="chat-scroll-container"
          className="flex flex-col gap-4"
        >
          {groupedMessageList.map((groupMsg, index) => (
            <div
              key={`${groupMsg.senderId}-${index}`}
              className="flex w-full items-start justify-start gap-2"
            >
              <Avatar src={groupMsg.sender?.avatar} alt="" className="shrink-0" />

              <div className="flex flex-1 flex-col items-stretch justify-start gap-1">
                <span className="mb-1 flex items-center gap-2">
                  <p className="font-semibold">{groupMsg.sender?.display_name}</p>
                  <p className="text-default-400 text-xs">
                    {dayjs(groupMsg.sentAt).format("HH:mm A")}
                  </p>
                </span>
                {groupMsg.messages.map((msg) => (
                  <SingleMessage key={msg.id} message={msg} />
                ))}
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>

      <div ref={bottomRef} id="chat-scroll-bottom" />
    </>
  );
}

const groupMessagesByUser = (messages: ChatMessage[]) => {
  const groups: ChatGroupedMessage[] = [];

  let currentGroup: ChatGroupedMessage | null = null;

  for (const msg of messages) {
    const msgTime = new Date(msg.created_at);

    const shouldStartNewGroup =
      !currentGroup ||
      currentGroup.senderId !== msg.sender?.id ||
      msgTime.getTime() - currentGroup.sentAt.getTime() > SPLIT_IMAGE_INTERVAL;

    if (shouldStartNewGroup) {
      currentGroup = {
        senderId: msg.sender?.id,
        sender: msg.sender,
        sentAt: msgTime,
        messages: [],
      };
      groups.push(currentGroup);
    }

    currentGroup?.messages.push(msg);
  }

  return groups;
};
