"use client";

import {
  addToast,
  Badge,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { ChatTalkIcon } from "../svg";
import { useChatStore } from "@/stores/chat.store";
import ChatMessageList from "./message-list";
import ChatActionSection from "./action-section";
import "./chat.scss";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/user.provider";
import { ChatMessage } from "@/interfaces/chat";
import ChatUploadModal from "./chat-upload/ChatUploadModal";
import { STATUS_CODE } from "@/constants/enums";
import ChatModalHeader from "./header";
import { CommonUtils } from "@/utils/common.utils";
import { UserInfo } from "@/interfaces/user";

const supabase = createClient();
export const typingChannel = supabase.channel(`hnb-talk-typing`);

export default function ChatModal() {
  const { user } = useUser();
  const { messages, setMessages, fetchMessages, isTyping } = useChatStore();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const chatUploadModal = useDisclosure();

  const [pastedFile, setPastedFile] = useState<File>();
  const [isMobile, setIsMobile] = useState<boolean>(CommonUtils.isMobile());

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;

          if (!messages.some((msg) => msg.id === newMessage.id)) {
            await fetch(`/api/chat/messages/${newMessage.id}`)
              .then((res) => res.json())
              .then((result) => {
                if (result.status !== STATUS_CODE.OK) {
                  addToast({ title: "Lỗi tải tin nhắn!", color: "danger" });
                  return;
                }

                const data: ChatMessage = result.data;
                setMessages((prev) => [...prev, data]);
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, messages, setMessages]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: any) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          setPastedFile(file);
          chatUploadModal.onOpen();
          e.preventDefault();
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, chatUploadModal]);

  useEffect(() => {
    typingChannel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        console.log({ payload, isTyping });
        if (user && payload.user.id !== user.id) {
          sendTyping(payload.user, true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setIsMobile(CommonUtils.isMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

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
        size={isMobile ? "full" : "5xl"}
        scrollBehavior="inside"
        classNames={{
          wrapper: "px-2 md:px-16",
          backdrop: "bg-linear-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <ChatModalHeader />
          </ModalHeader>

          <ModalBody className="gap-0 overflow-hidden px-0 py-1">
            <ChatMessageList isModalOpen={isOpen} />

            <ChatActionSection />
          </ModalBody>

          <ChatUploadModal
            file={pastedFile}
            isOpen={chatUploadModal.isOpen}
            onOpenChange={chatUploadModal.onOpenChange}
            onClose={() => {
              setPastedFile(undefined);
              chatUploadModal.onClose();
            }}
          />
        </ModalContent>
      </Modal>
    </div>
  );
}

export const sendTyping = (user: UserInfo | undefined, isTyping: boolean) => {
  if (!user) return;

  typingChannel.send({
    type: "broadcast",
    event: "typing",
    payload: {
      user: { id: user.id, display_name: user.display_name, avatar: user.avatar },
      isTyping,
    },
  });
};
