"use client";

import { Badge, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import { ChatTalkIcon } from "../svg";
import { useChatStore } from "@/stores/chat.store";
import ChatMessageList from "./message-list";
import ChatActionSection from "./action-section";

export default function ChatModal() {
  const messages = useChatStore((s) => s.messages);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  return (
    <div>
      <button
        onClick={onOpen}
        className="hover:bg-default-50 relative cursor-pointer rounded-md p-2 duration-200 focus:outline-none"
      >
        <Badge color="danger" content={messages.length} hidden={false}>
          <ChatTalkIcon className="h-6 w-6" />
        </Badge>
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        size="full"
        scrollBehavior="inside"
        classNames={{
          wrapper: "px-2 md:px-16",
          backdrop: "bg-linear-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          <ModalHeader>HNB Talk</ModalHeader>

          <ModalBody className="px-2 py-1 md:px-6">
            <ChatMessageList />
            <ChatActionSection />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
