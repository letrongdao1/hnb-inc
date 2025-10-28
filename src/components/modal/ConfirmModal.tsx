"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ModalProps,
  ButtonProps,
} from "@heroui/react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose: () => void;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  extra?: string | React.ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  modalProps?: Partial<ModalProps>;
  okButtonProps?: ButtonProps;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  onOpenChange,
  title = "Xác nhận",
  description = "Bạn chắc chắn muốn thực hiện hành động này?",
  extra,
  onConfirm,
  onClose = () => {},
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  modalProps,
  okButtonProps,
  loading,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} {...modalProps}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>
          <div className="flex w-full flex-col items-start justify-start gap-2">
            {description}
            {extra && <p className="text-sm font-light italic">{extra}</p>}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            {cancelText}
          </Button>
          <Button color="primary" onPress={onConfirm} isLoading={loading} {...okButtonProps}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
