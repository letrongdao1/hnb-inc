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
import React, { useEffect, useMemo, useState } from "react";
import UploadFileSection from "./UploadFileSection";
import FileInfoSection from "./FileInfoSection";
import { useRouter } from "next/navigation";
import { UPLOAD_REQUIRED_SECOND_PER_MB } from "@/constants/constants";
import { CHUNK_SIZE, MULTIPART_THRESHOLD } from "@/constants/b2_folder";
import { STATUS_CODE } from "@/constants/enums";

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

  const remainingUploadTime = useMemo(() => {
    const totalSize = uploadFileList.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);

    return Math.ceil(
      ((totalSize - (totalSize * uploadProgress) / 100) * UPLOAD_REQUIRED_SECOND_PER_MB) / 60
    );
  }, [uploadFileList, uploadProgress]);

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

  const buildMetaFormData = (props: UploadProps, file: File) => {
    const form = new FormData();
    form.append("folder", props.folderPath || "");
    form.append("title", props.title || "");
    form.append("description", props.description || "");
    form.append("files", file);
    form.append(`paths[0]`, file.webkitRelativePath || file.name);
    return form;
  };

  const handleUploadNormalFile = (
    file: File,
    props: UploadProps,
    updateTotalProgress: (delta: number) => void
  ) =>
    new Promise<void>((resolve, reject) => {
      const form = buildMetaFormData(props, file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/b2/upload");

      let prevLoaded = 0;

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;

        const delta = event.loaded - prevLoaded;
        prevLoaded = event.loaded;

        updateTotalProgress(delta);
      };

      xhr.onload = () => {
        if (xhr.status === STATUS_CODE.OK) {
          resolve();
        } else reject(xhr.statusText);
      };

      xhr.onerror = () => reject("Upload file thất bại!");
      xhr.send(form);
    });

  const handleUploadLargeFile = async (
    file: File,
    props: UploadProps,
    updateTotalProgress: (delta: number) => void
  ) => {
    const meta = buildMetaFormData(props, file);

    const startRes = await fetch("/api/b2/upload/multipart/start", {
      method: "POST",
      body: meta,
    });

    const { uploadId, key } = await startRes.json();

    const parts: { ETag: string; PartNumber: number }[] = [];
    let uploaded = 0;
    let partNumber = 1;

    for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE);

      const signRes = await fetch("/api/b2/upload/multipart/part", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId, partNumber }),
      });

      const { url } = await signRes.json();

      const res = await fetch(url, {
        method: "PUT",
        body: chunk,
      });

      if (!res.ok) throw new Error("Upload part failed");

      uploaded += chunk.size;
      updateTotalProgress(chunk.size);

      parts.push({
        ETag: res.headers.get("etag")!,
        PartNumber: partNumber,
      });

      partNumber++;
    }

    const completeRes = await fetch("/api/b2/upload/multipart/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        uploadId,
        parts,
        folder: props.folderPath,
        title: props.title,
        description: props.description,
      }),
    });

    if (!completeRes.ok) {
      addToast({
        title:
          "Không thể hoàn tất quá trình upload file. Vui lòng thông báo phòng IT để được hỗ trợ!",
        color: "danger",
      });

      return null;
    }

    const { url } = await completeRes.json();
    return url;
  };

  const handleUpload = async (props: UploadProps) => {
    if (!uploadFileList.length) {
      addToast({ title: "Vui lòng tải lên ít nhất 1 file!", color: "warning" });
      return;
    }

    const totalSize = uploadFileList.reduce((acc, f) => acc + f.size, 0);
    let totalUploaded = 0;

    const updateTotalProgress = (delta: number) => {
      totalUploaded += delta;
      const percent = Math.floor((totalUploaded / totalSize) * 100);
      setUploadProgress(percent);
    };

    progressModal.onOpen();

    try {
      for (const file of uploadFileList) {
        if (file.size >= MULTIPART_THRESHOLD) {
          await handleUploadLargeFile(file, props, updateTotalProgress);
        } else {
          await handleUploadNormalFile(file, props, updateTotalProgress);
        }
      }

      addToast({
        title: "Upload file lên cloud thành công!",
        description: `${uploadFileList.length} file`,
        color: "success",
      });

      handleClose();
      router.refresh();
    } catch (err) {
      addToast({ title: "Upload file thất bại!", color: "danger" });
      handleClose();
    }
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
                  <FileInfoSection
                    handleUpload={handleUpload}
                    uploadFileList={uploadFileList}
                    uploadProgress={uploadProgress}
                  />
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
                      <ModalBody className="space-y-4 px-2 py-4">
                        <Progress
                          label={
                            <p className="text-sm font-light">
                              {uploadProgress < 100 ? "Đang upload file..." : "Đang hoàn tất..."}
                            </p>
                          }
                          value={uploadProgress}
                          showValueLabel={true}
                          valueLabel={
                            uploadProgress < 100 ? (
                              `${uploadProgress}%`
                            ) : (
                              <Spinner color="success" variant="gradient" size="sm" />
                            )
                          }
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

                        <p
                          className={`text-sm font-light opacity-50 ${remainingUploadTime <= 0 && "invisible"}`}
                        >
                          Thời gian còn lại ước tính: ~ {remainingUploadTime} phút
                        </p>
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
