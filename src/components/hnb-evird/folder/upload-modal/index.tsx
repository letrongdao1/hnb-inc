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
import { FileUtils } from "@/utils/file.utils";

type UploadAssetsModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
};

export type UploadProps = {
  folderName: string;
  folderPath: string;
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

  const handleUploadNormalFile = async (
    file: File,
    props: UploadProps,
    updateTotalProgress: (delta: number) => void
  ) => {
    const startRes = await fetch("/api/b2/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        folder: props.folderPath,
        contentType: file.type,
      }),
    });

    const { uploadUrl, fileUrl, key } = await startRes.json();

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    // xhr.setRequestHeader("Content-Type", file.type);

    let prev = 0;
    xhr.upload.onprogress = (e) => {
      const delta = e.loaded - prev;
      prev = e.loaded;
      updateTotalProgress(delta);
    };

    await new Promise((resolve, reject) => {
      xhr.onload = () =>
        xhr.status < 300 ? resolve(null) : reject(`Upload thất bại: ${xhr.statusText}`);
      xhr.onerror = () => reject("Có lỗi xảy ra trong quá trình upload!");
      xhr.send(file);
    });

    await fetch("/api/b2/upload/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        fileUrl,
        folder: props.folderPath,
      }),
    })
      .then((res) => res.json())
      .then(async (result) => {
        if (result.status === STATUS_CODE.OK) {
          if (result.data && result.data.id) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const blurHash = await FileUtils.generateBlurHash(buffer);

            await fetch("/api/b2/upload/update-blurHash", {
              method: "PUT",
              body: JSON.stringify({
                blurHash,
                id: result.data.id,
              }),
            });
          }
        }
      });

    return fileUrl;
  };

  const handleUploadLargeFile = async (
    file: File,
    props: UploadProps,
    updateTotalProgress: (delta: number) => void
  ) => {
    const startRes = await fetch("/api/b2/upload/multipart/start", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        folder: props.folderPath,
        fileType: file.type,
      }),
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
      addToast({
        title: "Upload file thất bại.",
        description: "Vui lòng liên hệ phòng IT về vấn đề này để kịp thời khắc phục!",
        color: "danger",
      });
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
      isDismissable={!uploadFileList.length}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Upload file lên cloud</ModalHeader>

            <ModalBody className="relative space-y-4">
              <div
                className={`flex ${uploadFileList.length > 0 && "lg:min-h-[30vh]"} flex-col items-stretch justify-center gap-4 md:flex-row-reverse md:gap-8`}
              >
                <FileInfoSection
                  handleUpload={handleUpload}
                  uploadFileList={uploadFileList}
                  uploadProgress={uploadProgress}
                />

                <UploadFileSection
                  uploadFileList={uploadFileList}
                  setUploadFileList={setUploadFileList}
                />
              </div>

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
