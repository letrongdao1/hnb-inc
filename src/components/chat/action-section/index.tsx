"use client";

import { PlusIcon, SendIcon } from "@/components/svg";
import { Button, Input } from "@heroui/react";
import React from "react";

export default function ChatActionSection() {
  const handleSendMessage = async () => {};

  return (
    <div className="border-default-300 flex min-h-12 w-full items-stretch justify-between gap-1 border-t py-1">
      <div className="shrink-0">
        <Button startContent={<PlusIcon />} isIconOnly color="default" />
      </div>
      <Input
        placeholder={`Nhắn tin`}
        radius="sm"
        classNames={{ mainWrapper: "h-full", inputWrapper: "h-full" }}
        className="flex-1"
      />

      <Button
        color="primary"
        isIconOnly
        startContent={<SendIcon size={16} />}
        onPress={handleSendMessage}
      />
    </div>
  );
}
