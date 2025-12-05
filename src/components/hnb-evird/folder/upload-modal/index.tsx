"use client";

import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  addToast,
  Progress,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import UploadFileSection from "./UploadFileSection";
import FileInfoSection from "./FileInfoSection";

type UploadAssetsModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  handleFinishUpload: () => void;
};

export type UploadProps = {
  folderName: string;
  folderPath: string;
  title?: string;
  description?: string;
};

export default function UploadAssetsModal({
  isOpen,
  onClose,
  onOpenChange,
  handleFinishUpload,
}: UploadAssetsModalProps) {
  const [uploadFileList, setUploadFileList] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const progressModal = useDisclosure();

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isOpen && uploadProgress > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, [isOpen, uploadProgress]);

  const handleUpload = async (props: UploadProps) => {
    if (!uploadFileList.length) {
      addToast({ title: "Vui lòng tải lên ít nhất 1 file!", color: "warning" });
      return;
    }

    const totalSize = uploadFileList.reduce((sum, file) => sum + (file?.size || 0), 0);
    let uploadedBytes = 0;

    progressModal.onOpen();

    for (const file of uploadFileList) {
      await new Promise<void>((resolve, reject) => {
        const form = new FormData();
        form.append("files", file);
        form.append("folder", props.folderPath || "");
        form.append("title", props.title || "");
        form.append("description", props.description || "");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/b2/upload");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const totalUploaded = uploadedBytes + event.loaded;
            const percent = Math.round((totalUploaded / totalSize) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            uploadedBytes += file.size;
            resolve();
          } else {
            reject(new Error(xhr.statusText));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(form);
      }).catch((err) => {
        console.error(err);
        addToast({ title: err?.message || "Lỗi upload ảnh!", color: "danger" });
        handleClose();
      });
    }

    handleFinishUpload();
    addToast({
      title: `Tải file lên cloud thành công`,
      description: `Tổng: ${uploadFileList.length} file`,
      color: "success",
    });
    handleClose();
  };

  const handleClose = () => {
    setUploadFileList([]);
    setUploadProgress(0);
    progressModal.onClose();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={handleClose}
      size="5xl"
      placement="center"
      scrollBehavior="inside"
      isDismissable={false}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Upload file lên cloud</ModalHeader>

            <ModalBody className="relative space-y-4">
              <div
                className={`flex ${uploadFileList.length > 0 && "lg:min-h-[30vh]"} flex-col-reverse items-stretch justify-center gap-4 md:flex-row md:gap-2`}
              >
                <UploadFileSection
                  uploadFileList={uploadFileList}
                  setUploadFileList={setUploadFileList}
                />

                {uploadFileList.length > 0 && (
                  <FileInfoSection handleUpload={handleUpload} uploadProgress={uploadProgress} />
                )}
              </div>

              <Button color="default" variant="flat" className="ml-auto" onPress={handleClose}>
                Đóng
              </Button>

              <Modal
                isOpen={progressModal.isOpen}
                onOpenChange={progressModal.onOpenChange}
                onClose={progressModal.onClose}
                placement="center"
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                hideCloseButton
              >
                <ModalContent>
                  {() => (
                    <ModalBody className="px-2 py-4">
                      <Progress
                        label={
                          <p className="text-sm font-light">
                            {uploadProgress < 100
                              ? "Đang tải ảnh lên..."
                              : "Đang hoàn tất quá trình..."}
                          </p>
                        }
                        value={uploadProgress}
                        showValueLabel={true}
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: "w-full",
                          track: "drop-shadow-md border border-default",
                          indicator: "bg-linear-to-r from-pink-500 to-yellow-500",
                          label: "tracking-wider font-medium text-default-600",
                          value: "text-foreground/60",
                        }}
                      />
                    </ModalBody>
                  )}
                </ModalContent>
              </Modal>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
