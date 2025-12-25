"use client";

import React from "react";
import { ChatTalkIcon } from "@/components/svg";
import FriendListDrawer from "@/components/navbar/friendList";

export default function ChatModalHeader() {
  return (
    <div className="flex w-full items-center justify-between gap-2 pr-4">
      <div className="flex items-center gap-2">
        <ChatTalkIcon />
        <p className="text-lg font-semibold">HNB Talk</p>
      </div>

      <div className="flex items-center gap-2">
        <FriendListDrawer />
      </div>
    </div>
  );
}
