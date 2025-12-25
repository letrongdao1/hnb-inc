"use client";

import { useMemo, useRef, useState } from "react";
import { useChatStore } from "@/stores/chat.store";
import { ChatUtils } from "@/utils/chat.utils";
import { Button } from "@heroui/react";
import { CornerLeftDownIcon } from "@/components/svg";
import dayjs from "dayjs";
import SingleGroupMessage from "./SingleGroupMessage";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import EmptyComponent from "@/components/empty/empty";
import { LoaderIcon } from "@/components/loader";

export default function ChatMessageList() {
  const { messages, fetchMessages, hasMore, isFetching } = useChatStore();

  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

  const groupedMessageList = useMemo(() => ChatUtils.groupMessages(messages), [messages]);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const scrollToBottom = () => {
    if (!groupedMessageList.length) return;

    virtuosoRef.current?.scrollToIndex({
      index: groupedMessageList.length - 1,
      align: "end",
      behavior: "smooth",
    });
  };

  if (!groupedMessageList.length)
    return isFetching ? <LoaderIcon /> : <EmptyComponent title="Chưa có tin nhắn nào" />;

  return (
    <div className="relative h-full flex-1">
      {!isAtBottom && (
        <div className="absolute right-4 bottom-4 z-50">
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

      <Virtuoso
        key={groupedMessageList.length}
        ref={virtuosoRef}
        data={groupedMessageList}
        initialTopMostItemIndex={{
          index: groupedMessageList.length - 1,
          align: "end",
        }}
        itemContent={(index, dateGroupMsg) => (
          <SingleGroupMessage
            key={`${dayjs(dateGroupMsg.date).format("YYYYMMDD")}-${index}`}
            dateGroupMsg={dateGroupMsg}
          />
        )}
        startReached={() => {
          if (hasMore) fetchMessages();
        }}
        atBottomStateChange={setIsAtBottom}
        followOutput="auto"
        overscan={200}
      />
    </div>
  );
}
