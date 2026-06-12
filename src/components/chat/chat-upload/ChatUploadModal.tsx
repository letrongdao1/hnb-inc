"use client";

import { SendIcon } from "@/components/svg";
import ImagePreviewModal from "@/components/ui/preview-modal";
import { STATUS_CODE } from "@/constants/enums";
import { ChatMessage, ChatMessageStatusEnum, ChatMessageTypeEnum } from "@/interfaces/chat";
import { useUser } from "@/providers/user.provider";
import { useChatStore } from "@/stores/chat.store";
import { CommonUtils } from "@/utils/common.utils";
import {
  addToast,
  Button,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type ChatUploadModalProps = {
  file?: File;
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
};

export default function ChatUploadModal({
  file,
  isOpen,
  onClose,
  onOpenChange,
}: ChatUploadModalProps) {
  const { user } = useUser();
  const { setMessages, updateMessage } = useChatStore();

  const [messageInput, setMessageInput] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>("");

  const previewModal = useDisclosure();

  useEffect(() => {
    if (!file) {
      return;
    }

    if (file.type.startsWith("image/")) {
      setCurrentUrl(URL.createObjectURL(file));
    }
  }, [file]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (CommonUtils.isMobile()) {
      return;
    }

    if (e.key === "Enter") {
      if (e.shiftKey || e.altKey) return;

      e.preventDefault();
      handleSendFileMessage();
    }
  };

  const handleSendFileMessage = async () => {
    if (!file || !user) return;

    const trim = messageInput.trim();
    const id = uuidv4();

    const tempMessage: ChatMessage = {
      id,
      content: trim,
      type: ChatMessageTypeEnum.IMAGE,
      sender: {
        id: user.id,
        display_name: user.display_name,
        avatar: user.avatar,
      },
      attachment_url: undefined,
      is_pinned: false,
      status: ChatMessageStatusEnum.SENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    setMessageInput("");
    onClose();

    const form = new FormData();
    form.append("files", file);
    form.append("id", id);
    form.append("content", trim);

    fetch("/api/chat/messages/file", {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status !== STATUS_CODE.CREATED) {
          addToast({ title: "Gửi tin nhắn lỗi. Vui lòng liên hệ phòng IT để được hỗ trợ!" });
        }

        const data = result.data;
        if (!data) return;

        updateMessage(data, id);
      })
      .catch(() => {
        console.log("Lỗi gửi tin nhắn");
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
      size="xl"
      placement="bottom-center"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>Gửi file phương tiện</ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-2">
            <Textarea
              label="Tin nhắn đính kèm"
              placeholder="Mô tả..."
              description="Không bắt buộc"
              labelPlacement="inside"
              autoFocus={true}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />

            {currentUrl && (
              <>
                <Image
                  src={currentUrl}
                  alt={file?.name}
                  className="mx-auto max-h-40 w-auto max-w-full cursor-pointer object-contain"
                  onClick={previewModal.onOpen}
                />

                <ImagePreviewModal
                  src={currentUrl}
                  alt={`preview-${file?.name}`}
                  isOpen={previewModal.isOpen}
                  onOpenChange={previewModal.onOpenChange}
                  onClose={previewModal.onClose}
                />
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-col items-stretch gap-2">
          <Button
            color="primary"
            fullWidth
            startContent={<SendIcon size={16} />}
            onPress={handleSendFileMessage}
          >
            Gửi
          </Button>
          <Button size="sm" color="default" variant="faded" fullWidth onPress={onClose}>
            Hủy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
