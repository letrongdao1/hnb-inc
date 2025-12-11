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
  Spinner,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import UploadFileSection from "./UploadFileSection";
import FileInfoSection from "./FileInfoSection";
import { useRouter } from "next/navigation";

type UploadAssetsModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
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
}: UploadAssetsModalProps) {
  const router = useRouter();

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

    const form = new FormData();
    form.append("folder", props.folderPath || "");
    form.append("title", props.title || "");
    form.append("description", props.description || "");

    let totalSize = 0;

    uploadFileList.forEach((file, index) => {
      form.append("files", file);

      form.append(`paths[${index}]`, file.webkitRelativePath || file.name);

      totalSize += file.size;
    });

    progressModal.onOpen();

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", "/api/b2/upload");

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;

        const percent = Math.floor((event.loaded / totalSize) * 100);
        setUploadProgress(percent);
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve();
        else reject(xhr.statusText);
      };

      xhr.onerror = () => reject("Upload file thất bại!");

      xhr.send(form);
    })
      .then(() => {
        addToast({
          title: "Upload file lên cloud thành công!",
          description: `${uploadFileList.length} file`,
          color: "success",
        });
        handleClose();
        router.refresh();
      })
      .catch((err) => {
        addToast({ title: "Upload file thất bại!", color: "danger" });
        handleClose();
      });
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
                    <>
                      <ModalBody className="px-2 py-4">
                        <Progress
                          label={
                            <p className="text-sm font-light">
                              {uploadProgress < 100 ? "Đang chuẩn bị..." : "Đang upload file..."}
                            </p>
                          }
                          value={uploadProgress}
                          showValueLabel={true}
                          valueLabel={<Spinner color="success" variant="gradient" size="sm" />}
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
                    </>
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
