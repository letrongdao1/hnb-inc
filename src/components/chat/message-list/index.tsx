"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from "@/stores/chat.store";
import { ChatUtils } from "@/utils/chat.utils";
import { Button } from "@heroui/react";
import { CornerLeftDownIcon } from "@/components/svg";
import dayjs from "dayjs";
import SingleGroupMessage from "./SingleGroupMessage";
import EmptyComponent from "@/components/empty/empty";
import { LoaderIcon } from "@/components/loader";

const BOTTOM_OFFSET = 100;

type ChatMessageListProps = {
  isModalOpen: boolean;
};

export default function ChatMessageList({ isModalOpen }: ChatMessageListProps) {
  const { messages, fetchMessages, hasMore, isFetching, isTyping } = useChatStore();

  const msgContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const groupedMessageList = useMemo(() => ChatUtils.groupMessages(messages), [messages]);

  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);

  useEffect(() => {
    if (isModalOpen) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const scrollToBottom = () => {
    if (!groupedMessageList.length) return;

    bottomRef?.current?.scrollIntoView({ behavior: "instant" });
    setIsAtBottom(true);
  };

  const handleScroll = async (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    setIsAtBottom(scrollTop + clientHeight > scrollHeight - BOTTOM_OFFSET);

    if (!hasMore) return;

    if (scrollTop === 0) {
      const container = msgContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      await fetchMessages();
      const newScrollHeight = container?.scrollHeight || 0;
      if (container) {
        container.scrollTop = newScrollHeight - prevScrollHeight;
      }
    }
  };

  if (!groupedMessageList.length)
    return (
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden">
        {isFetching ? <LoaderIcon /> : <EmptyComponent title="Chưa có tin nhắn nào" />}
      </div>
    );

  return (
    <div className="relative flex flex-1 flex-col justify-end overflow-hidden">
      {!isAtBottom && (
        <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2">
          <Button
            size="sm"
            color="default"
            variant="faded"
            startContent={<CornerLeftDownIcon size={16} />}
            onPress={scrollToBottom}
          >
            Trở về tin mới nhất
          </Button>
        </div>
      )}

      {isFetching && (
        <div className="flex w-full scale-75 items-center justify-center gap-2 opacity-75">
          <LoaderIcon /> Đang tải tin nhắn
        </div>
      )}

      <div
        ref={msgContainerRef}
        className="relative flex max-h-full flex-col overflow-y-auto pr-1"
        onScroll={handleScroll}
      >
        {groupedMessageList.map((groupMsg, index) => (
          <SingleGroupMessage
            key={`${dayjs(groupMsg.date).format("YYYYMMDD")}`}
            index={index}
            dateGroupMsg={groupMsg}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      <div
        className={`flex min-h-6 items-center py-1 pl-2 ${isTyping.length === 0 && "invisible"}`}
      >
        {isTyping.map((user, i) => (
          <div
            key={i}
            className={`bg-default-300 aspect-square w-6 rounded-full bg-cover bg-center bg-no-repeat text-sm font-medium ${i > 0 ? "-ml-1" : ""} `}
            style={{ backgroundImage: `url(${user.avatar})` }}
          />
        ))}
      </div>
    </div>
  );
}
