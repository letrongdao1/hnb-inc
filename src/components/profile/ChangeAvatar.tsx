"use client";

import { useLoading } from "@/hooks/useLoading";
import { addToast, Avatar, Button, Skeleton } from "@heroui/react";
import React, { useEffect, useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { CheckIcon, UploadIcon } from "../svg";
import { useUser } from "@/providers/user.provider";
import { STATUS_CODE } from "@/constants/enums";
import imageCompression from "browser-image-compression";
import { IMAGE_COMPRESS_OPTIONS } from "@/constants/constants";

export default function ChangeAvatar({ onClose }: { onClose: () => void }) {
  const { loading, setLoading } = useLoading();
  const updateLoading = useLoading();
  const { user, setUser } = useUser();

  const [defaultAvatars, setDefaultAvatars] = useState<string[]>([]);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>("");
  const [uploadImages, setUploadImages] = useState<ImageListType>([]);

  useEffect(() => {
    if (user) setCurrentAvatarUrl(user.avatar);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const fetchDefaultAvatarList = async () => {
      await fetch("/api/profile/default-avatars")
        .then((res) => res.json())
        .then((result) => {
          setDefaultAvatars(result.data);
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    };

    fetchDefaultAvatarList();
  }, [setLoading]);

  const handleUploadChange = async (
    imageList: ImageListType,
    _addUpdateIndex: number[] | undefined
  ) => {
    if (!imageList || !imageList.length) return;

    const parsedImageList = await Promise.all(
      imageList.map(async (img) => {
        if (!img.file) return img;

        const compressedFile = await imageCompression(img.file, IMAGE_COMPRESS_OPTIONS);
        const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
        return {
          data_url: base64,
          file: compressedFile,
        };
      })
    );

    setCurrentAvatarUrl("");
    setUploadImages(parsedImageList);
  };

  const handleChangeAvatar = async () => {
    if (!user) return;

    updateLoading.setLoading(true);

    let image: string = "";

    if (Boolean(currentAvatarUrl)) {
      if (currentAvatarUrl === user.avatar) {
        setLoading(false);
        return onClose();
      } else {
        image = currentAvatarUrl;
      }
    }

    if (Boolean(uploadImages.length) && uploadImages[0].data_url && uploadImages[0].file) {
      //Upload new file
      await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64: uploadImages[0].data_url,
          fileName: uploadImages[0].file.name,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            image = result.data || "";
          }
        })
        .catch((error) => {
          console.log({ error });
          return addToast({
            title: "Tải ảnh lên thất bại!",
            color: "danger",
          });
        });
    }

    // Delete current avatar
    await fetch("/api/upload", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileUrl: user.avatar,
      }),
    }).catch((error) => {
      console.log({ error: "Xóa file ảnh hiện tại thất bại: " + error });
    });

    // Update profile avatar
    await fetch("/api/profile/info", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ avatar: image }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.data) {
          setUser(result.data);
          addToast({
            title: "Cập nhật ảnh đại diện thành công",
            color: "success",
          });
        } else {
          addToast({
            title: "Cập nhật ảnh đại diện lỗi",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "Cập nhật ảnh đại diện lỗi",
          color: "danger",
        });
      })
      .finally(() => {
        updateLoading.setLoading(false);
        onClose();
      });
  };

  return (
    <div className="flex flex-col items-stretch gap-4">
      <ImageUploading value={uploadImages} onChange={handleUploadChange} dataURLKey="data_url">
        {({ imageList, onImageUpload, onImageRemoveAll, isDragging, dragProps }) => (
          <div className="mx-auto flex flex-col items-center gap-4">
            <Button
              {...dragProps}
              onPress={onImageUpload}
              variant="flat"
              className={`h-40 w-40 rounded-full border border-dashed bg-cover bg-center bg-no-repeat duration-200 ${isDragging && "opacity-50"}`}
              style={{
                backgroundImage: `url(${currentAvatarUrl || imageList?.[0]?.["data_url"]})`,
              }}
            ></Button>

            <div className="mx-auto grid grid-cols-6 items-center justify-center gap-2">
              {loading ? (
                <div className="flex w-full flex-col items-stretch gap-2">
                  {Array.from({ length: 2 }, (_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-md bg-gray-500" />
                  ))}
                </div>
              ) : (
                defaultAvatars.map((ava, index) => (
                  <Avatar
                    key={index}
                    src={ava}
                    alt=""
                    isBordered={ava === currentAvatarUrl}
                    onClick={() => {
                      onImageRemoveAll();
                      setCurrentAvatarUrl(ava);
                    }}
                    className={`cursor-pointer ${ava !== currentAvatarUrl && "brightness-50 hover:brightness-100"} duration-200`}
                  />
                ))
              )}
            </div>
            <p className="text-center text-sm italic">Chọn hoặc upload avatar cho riêng bạn!</p>
            <Button onPress={onImageUpload} fullWidth startContent={<UploadIcon size={16} />}>
              Tải ảnh lên
            </Button>
          </div>
        )}
      </ImageUploading>

      <div className="flex flex-col-reverse items-stretch justify-end gap-2 md:flex-row">
        <Button color="default" variant="light" onPress={onClose}>
          Huỷ
        </Button>
        <Button
          color="success"
          onPress={handleChangeAvatar}
          startContent={!updateLoading.loading && <CheckIcon size={16} />}
          isLoading={updateLoading.loading}
        >
          Xong
        </Button>
      </div>
    </div>
  );
}
