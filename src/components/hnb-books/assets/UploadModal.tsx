"use client";

import { CursorIcon, DeleteIcon, HandIcon, PlusIcon, UploadIcon } from "@/components/svg";
import {
  Button,
  Modal,
  ModalContent,
  Input,
  Textarea,
  ModalHeader,
  ModalBody,
  addToast,
  Image,
  Progress,
} from "@heroui/react";
import React, { useState } from "react";
import ReactImageUploading, { ImageListType } from "react-images-uploading";

type UploadAssetsModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
};

export default function UploadAssetsModal({
  isOpen,
  onClose,
  onOpenChange,
}: UploadAssetsModalProps) {
  const [uploadImageList, setUploadImageList] = useState<ImageListType>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState("");
  const [fileProgress, setFileProgress] = useState<{ [key: string]: number }>({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadChange = async (
    imageList: ImageListType,
    _addUpdateIndex: number[] | undefined
  ) => {
    if (!imageList || !imageList.length) return;

    setUploadImageList((prev) => {
      const combined = [...prev, ...imageList];

      const uniqueFilesMap: { [key: string]: ImageListType[number] & { previewUrl: string } } = {};

      combined.forEach((img) => {
        if (img.file) {
          const key = `${img.file.name}-${img.file.size}`;
          uniqueFilesMap[key] = {
            ...img,
            previewUrl: img.previewUrl || URL.createObjectURL(img.file),
          };
        }
      });

      return Object.values(uniqueFilesMap);
    });
  };

  const handleUpload = async () => {
    if (!uploadImageList.length)
      return addToast({ title: "Vui lòng chọn ít nhất 1 file!", color: "warning" });

    const totalSize = uploadImageList.reduce((prev, current) => {
      return prev + (current.file ? current.file.size : 0);
    }, 0);

    const updatedFileProgress: { [key: string]: number } = {};
    uploadImageList.forEach((f) => (updatedFileProgress[f.fileKey] = 0));
    setFileProgress(updatedFileProgress);

    for (const img of uploadImageList) {
      await new Promise<void>((resolve, reject) => {
        const form = new FormData();
        form.append("files", img.file as File);
        form.append("title", title);
        form.append("description", description);
        form.append("folder", folder);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/b2/upload");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setFileProgress((prev) => ({ ...prev, [img.fileKey]: percent }));

            const uploadedBytes = uploadImageList.reduce((acc, f) => {
              const p =
                f.fileKey === img.fileKey
                  ? event.loaded
                  : ((fileProgress[f.fileKey] || 0) / 100) * (f.file?.size || 0);
              return acc + p;
            }, 0);

            setUploadProgress(Math.round((uploadedBytes / totalSize) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) resolve();
          else reject(new Error(xhr.statusText));
        };

        xhr.onerror = () => reject(new Error("Upload failed"));

        xhr.send(form);
      }).catch((err) => {
        console.error(err);
        addToast({ title: err?.message || "Lỗi upload ảnh!", color: "danger" });
      });
    }

    setUploadImageList([]);
    setTitle("");
    setDescription("");
    setFolder("");
    onClose();
  };

  const handleRemoveImage = (index: number) => {
    const img = uploadImageList[index];
    if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);

    setUploadImageList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAll = () => {
    uploadImageList.forEach((img) => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    });
    setUploadImageList([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
      size="5xl"
      placement="top-center"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Upload ảnh</ModalHeader>

            <ModalBody className="space-y-4">
              <ReactImageUploading
                multiple
                value={uploadImageList}
                onChange={handleUploadChange}
                dataURLKey="data_url"
              >
                {({ imageList, onImageUpload, onImageRemoveAll, isDragging, dragProps }) => (
                  <div className="mx-auto space-y-3">
                    {Boolean(imageList.length) && (
                      <div className="grid max-h-[40vh] grid-cols-[repeat(auto-fill,minmax(100px,1fr))] items-stretch gap-2 overflow-y-auto">
                        {imageList.map((image, index) =>
                          !image.file ? (
                            <></>
                          ) : (
                            <div
                              key={index}
                              className="group flex flex-col overflow-hidden rounded bg-white/5 shadow-sm transition-shadow duration-150 hover:shadow-md"
                            >
                              <div className="flex w-full flex-1 items-stretch overflow-hidden">
                                <Image
                                  src={image.previewUrl}
                                  alt={"upload"}
                                  loading="lazy"
                                  radius="none"
                                  className="h-full w-full object-cover object-center duration-200 group-hover:scale-105"
                                />
                              </div>

                              <div className="p-2 text-sm">
                                <div className="truncate font-medium">{image.file?.name}</div>
                                <div className="mt-1 text-xs text-gray-400">
                                  {image.file && `${Math.round(image.file.size / 1024)} KB`}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        {Boolean(imageList.length) && (
                          <Button
                            {...dragProps}
                            isIconOnly
                            radius="full"
                            startContent={<PlusIcon />}
                            onPress={onImageUpload}
                            variant="flat"
                            className={`m-auto h-24 w-24`}
                          />
                        )}
                      </div>
                    )}
                    <Button
                      {...dragProps}
                      onPress={onImageUpload}
                      variant="flat"
                      className={`aspect-[3/1] h-24 rounded-md border border-dashed bg-contain bg-center bg-no-repeat px-4 duration-200 ${
                        isDragging && "border-solid"
                      }`}
                      hidden={Boolean(imageList.length)}
                    >
                      <div className="text-center">
                        <p className="font-semibold">Ảnh</p>
                        <span
                          className={`flex items-center gap-1 opacity-50 duration-200 ${
                            isDragging && "opacity-100"
                          }`}
                        >
                          {isDragging ? <HandIcon /> : <CursorIcon size={16} />}
                          {isDragging
                            ? "Thả vào đây để tải ảnh lên"
                            : "Nhấn hoặc kéo thả để tải ảnh lên"}
                        </span>
                      </div>
                    </Button>

                    <Button
                      fullWidth
                      color="danger"
                      variant="bordered"
                      onPress={handleRemoveAll}
                      startContent={<DeleteIcon />}
                      className="w-full flex-1 py-2 font-semibold"
                      hidden={!Boolean(imageList.length)}
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                )}
              </ReactImageUploading>

              <Input
                label="Tiêu đề"
                placeholder="Nhập tiêu đề..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                label="Mô tả"
                placeholder="Mô tả..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                label="Thư mục lưu"
                placeholder="Chọn thư mục lưu..."
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
              />

              {uploadProgress === 0 ? (
                <Button
                  variant={uploadProgress === 0 ? "solid" : "bordered"}
                  color={uploadProgress === 0 ? "primary" : "success"}
                  onPress={handleUpload}
                  fullWidth
                  startContent={uploadProgress === 0 && <UploadIcon size={16} />}
                >
                  Tải {uploadImageList.length > 0 && uploadImageList.length} ảnh lên
                </Button>
              ) : (
                <Progress
                  label={"Đang tải ảnh lên..."}
                  value={uploadProgress}
                  radius="sm"
                  showValueLabel={true}
                  size="sm"
                  classNames={{
                    base: "max-w-md",
                    track: "drop-shadow-md border border-default",
                    indicator: "bg-linear-to-r from-pink-500 to-yellow-500",
                    label: "tracking-wider font-medium text-default-600",
                    value: "text-foreground/60",
                  }}
                />
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
