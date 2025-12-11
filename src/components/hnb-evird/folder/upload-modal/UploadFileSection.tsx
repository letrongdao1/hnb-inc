"use client";

import ImagePreviewModal from "@/components/preview-modal";
import {
  DeleteIcon,
  FileIcon,
  FolderIcon,
  PlusIcon,
  UploadIcon,
  VideoCameraIcon,
} from "@/components/svg";
import { FileUtils } from "@/utils/file.utils";
import { Button, Image, useDisclosure } from "@heroui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

type UploadFileSectionProps = {
  uploadFileList: File[];
  setUploadFileList: React.Dispatch<React.SetStateAction<File[]>>;
};

const MAX_PREVIEW_SIZE = 10;

export default function UploadFileSection({
  uploadFileList,
  setUploadFileList,
}: UploadFileSectionProps) {
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [currentPreviewSrc, setCurrentPreviewSrc] = useState<string>();
  const [isVideo, setIsVideo] = useState<boolean>(false);

  const previewModal = useDisclosure();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const totalUploadSize = useMemo(
    () => uploadFileList.reduce((prev, file) => prev + file.size, 0),
    [uploadFileList]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setUploadFileList((prev) => [...prev, ...selected]);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setUploadFileList((prev) => [...prev, ...selected]);
  };

  const handleOpenPreview = (src: string) => {
    setCurrentPreviewSrc(src);
    previewModal.onOpen();
  };

  useEffect(() => {
    const newPreviews: { [key: string]: string } = {};

    uploadFileList.forEach(async (file) => {
      if (Object.keys(newPreviews).some((key) => key === file.name)) return;

      newPreviews[file.name] = URL.createObjectURL(file);
    });

    setPreviews(newPreviews);

    return () => {
      Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadFileList]);

  if (!uploadFileList.length)
    return (
      <div className="flex flex-1 flex-col items-stretch justify-center gap-2 md:flex-row">
        <div className="flex-1">
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={`bg-default-200 hover:bg-default-300 flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg duration-200`}
          >
            <FileIcon size={32} />
            <p>Chọn file</p>
          </button>
          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
          />
        </div>

        <div className="flex-1">
          <button
            onClick={() => {
              if (folderInputRef.current) {
                folderInputRef.current.click();
              }
            }}
            className={`hover:bg-default-100 border-default-300 flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 duration-200`}
          >
            <FolderIcon size={32} />
            Chọn thư mục
          </button>
          <input
            ref={folderInputRef}
            hidden
            type="file"
            webkitdirectory="true"
            onChange={handleFolderSelect}
            {...({} as any)}
          />
        </div>
      </div>
    );

  return (
    <div className="z-0 flex flex-1 flex-col items-stretch gap-1">
      <div className="flex max-h-96 flex-col items-stretch justify-start gap-1 overflow-y-auto">
        {uploadFileList.map((file, index) => (
          <div
            key={index}
            className={`group border-default-300 flex items-center gap-2 border-b px-2 py-1 text-sm`}
          >
            {file.type.startsWith("image/") ? (
              <Image
                src={previews[file.name]}
                alt={file.name}
                radius="sm"
                onClick={() => {
                  setIsVideo(false);
                  handleOpenPreview(previews[file.name]);
                }}
                className="h-8 w-8 cursor-pointer object-cover duration-200 hover:scale-110"
              />
            ) : (
              <button
                onClick={() => {
                  setIsVideo(true);
                  handleOpenPreview(previews[file.name]);
                }}
                className="cursor-pointer px-1 duration-200 hover:scale-110"
              >
                <VideoCameraIcon />
              </button>
            )}
            <div className="flex flex-1 items-center justify-start gap-2">
              <p className="line-clamp-1">{file.name}</p>
              <button
                onClick={() => {
                  setUploadFileList((prev) => prev.filter((_, i) => index !== i));
                }}
                className="inline cursor-pointer text-red-500 duration-200 group-hover:inline hover:scale-110 md:hidden"
              >
                <DeleteIcon size={16} />
              </button>
            </div>

            <p className="font-extralight">{FileUtils.formatFileSize(file.size)}</p>
          </div>
        ))}
      </div>

      <span className="flex-1" />

      <div className="flex items-center justify-between gap-1 px-2">
        <p className="text-xs font-light">Tổng: {uploadFileList.length} file</p>
        <div className="flex-1" />
        <p className="text-sm font-bold">{FileUtils.formatFileSize(totalUploadSize)}</p>
      </div>

      <div className="flex shrink-0 items-stretch gap-2">
        <div className="flex-1">
          <Button
            fullWidth
            color="primary"
            variant="flat"
            onPress={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            startContent={<UploadIcon size={16} />}
          >
            Chọn thêm file
          </Button>
          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
          />
        </div>

        <Button
          color="danger"
          variant="flat"
          onPress={() => {
            setUploadFileList([]);
          }}
          startContent={<DeleteIcon size={16} />}
          className="flex-1 shrink-0"
        >
          Xóa tất cả
        </Button>
      </div>

      {currentPreviewSrc && (
        <ImagePreviewModal
          isOpen={previewModal.isOpen}
          onOpenChange={previewModal.onOpenChange}
          onClose={previewModal.onClose}
          src={currentPreviewSrc}
          alt="preview"
          isVideo={isVideo}
        />
      )}
    </div>
  );
}
