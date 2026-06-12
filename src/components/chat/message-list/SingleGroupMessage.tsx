"use client";

import { ChatDateGroupedMessage } from "@/interfaces/chat";
import { ChatUtils } from "@/utils/chat.utils";
import SingleMessage from "./SingleMessage";

type SingleGroupMessageProps = {
  index: number;
  dateGroupMsg: ChatDateGroupedMessage;
};

export default function SingleGroupMessage({ index, dateGroupMsg }: SingleGroupMessageProps) {
  return (
    <div className={`${index !== 0 && "mt-2"} space-y-2`}>
      <div className="flex w-full items-center justify-between gap-2 px-8 opacity-75">
        <div className="border-default-300 flex-1 border-t" />
        <p className="text-xs font-light">
          {ChatUtils.getMessageGroupSplitterTimeDisplay(dateGroupMsg.date)}
        </p>
        <div className="border-default-300 flex-1 border-t" />
      </div>

      <div className="space-y-2">
        {dateGroupMsg.groups.map((groupMsg, index) => (
          <div
            key={`${groupMsg.senderId}-${index}`}
            className="flex flex-1 flex-col items-stretch justify-start"
          >
            {groupMsg.messages.map((msg, index) => (
              <SingleMessage key={msg.id} message={msg} isTopMessage={index === 0} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
