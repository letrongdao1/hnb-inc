"use client";

import React, { useState } from "react";
import { ImageIcon, PlusIcon, SendIcon } from "@/components/svg";
import { ChatMessage, ChatMessageStatusEnum, ChatMessageTypeEnum } from "@/interfaces/chat";
import { useUser } from "@/providers/user.provider";
import { useChatStore } from "@/stores/chat.store";
import { CommonUtils } from "@/utils/common.utils";
import { addToast, Button, Textarea } from "@heroui/react";
import { v4 as uuidv4 } from "uuid";
import { STATUS_CODE } from "@/constants/enums";
import { motion, AnimatePresence } from "framer-motion";
import { MemeIcon } from "@/components/svg";

export default function ChatActionSection() {
  const { user } = useUser();
  const { updateMessage, setMessages } = useChatStore();
  const [messageInput, setMessageInput] = useState<string>("");
  const [isActionMenuExtended, setIsActionMenuExtended] = useState<boolean>(false);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (CommonUtils.isMobile()) {
      return;
    }

    if (e.key === "Enter") {
      if (e.shiftKey || e.altKey) return;

      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const trim = messageInput.trim();

    if (!trim.length || !user) return;

    const tempId = uuidv4();

    const payload: Partial<ChatMessage> = {
      content: trim,
      type: ChatMessageTypeEnum.TEXT,
    };

    const tempMessage: ChatMessage = {
      id: tempId,
      content: trim,
      type: ChatMessageTypeEnum.TEXT,
      sender: {
        id: user.id,
        display_name: user.display_name,
        avatar: user.avatar,
      },
      is_pinned: false,
      status: ChatMessageStatusEnum.SENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    setMessageInput("");

    fetch("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status !== STATUS_CODE.CREATED) {
          addToast({
            title: "Gửi tin nhắn lỗi. Vui lòng liên hệ phòng IT để được hỗ trợ!",
            color: "danger",
          });
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));

          return;
        }

        const data = result.data;
        if (!data) return;

        updateMessage(data, tempId);
      })
      .catch(() => {
        addToast({
          title: "Gửi tin nhắn lỗi. Vui lòng liên hệ phòng IT để được hỗ trợ!",
          color: "danger",
        });
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      });
  };

  return (
    <div
      className={`border-default-300 flex h-full w-full flex-0 shrink-0 items-stretch justify-between gap-1 border-t py-1 pr-2`}
      id="chat-input-container"
    >
      <div className="flex shrink-0 items-center justify-start gap-2 pl-2">
        <Button
          isIconOnly
          color="default"
          startContent={
            <PlusIcon
              className={`${isActionMenuExtended ? "rotate-z-90" : "rotate-0"} duration-200`}
            />
          }
          onPress={() => {
            setIsActionMenuExtended((isExtended) => !isExtended);
          }}
        />

        <AnimatePresence>
          {isActionMenuExtended && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "fit-content" }}
              exit={{ width: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex h-1 items-center justify-start gap-2"
            >
              <Button variant="bordered" startContent={<ImageIcon />} isIconOnly />
              <Button variant="bordered" startContent={<MemeIcon />} isIconOnly />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Textarea
        value={messageInput}
        onChange={(e) => {
          setMessageInput(e.target.value);
        }}
        onKeyDown={handleInputKeyDown}
        placeholder={`Nhắn tin`}
        radius="sm"
        minRows={1}
        maxRows={10}
        fullWidth
        classNames={{ inputWrapper: "px-0 pl-3" }}
        className="flex-1"
      />

      <Button
        color="primary"
        isIconOnly
        radius="sm"
        startContent={<SendIcon size={16} />}
        onPress={handleSendMessage}
        className=""
      />
    </div>
  );
}
