"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import IMAGE_PLACEHOLDER from "@/assets/icons/image-placeholder.svg";
import { addToast, Avatar, Button, DatePicker, Form, Input } from "@heroui/react";
import { ArrowRightIcon } from "@/components/svg";
import { SupabaseFile } from "../interfaces/supabaseFile";
import { uploadAvatar } from "./page";
import { STATUS_CODE } from "../constants/status";

const PLUS_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#000">
    <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
  </svg>
);

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function GetStartView({ defaultAvatars }: { defaultAvatars: string[] }) {
  const shuffledAvatarList = useMemo(() => shuffleArray(defaultAvatars || []), [defaultAvatars]);

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>();
  const [uploadedFile, setUploadedFile] = useState<File>();

  useEffect(() => {
    setCurrentAvatarUrl(shuffledAvatarList[0]);
  }, [shuffledAvatarList]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE = 500 * 1024;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      return addToast({
        title: "Kích thước file quá lớn!",
        description: `Vui lòng tải file có kích thước tối đa ${MAX_FILE_SIZE / 1024}KB`,
        color: "danger",
      });
    }

    setCurrentAvatarUrl(URL.createObjectURL(file));
    setUploadedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    let avatar: string = "";
    if (uploadedFile) {
      const uploadResponse = await uploadAvatar(uploadedFile);
      if (uploadResponse) {
        if (uploadResponse.status === STATUS_CODE.OK) {
          console.log(uploadResponse.data);
          avatar = uploadResponse.data;
        }
      }
    }

    const { display_name, phone, dob } = data;
    const params = { display_name, phone, dob, avatar };
    
  };

  const uploadRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (uploadRef && uploadRef.current) {
      uploadRef.current.click();
    }
  };
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 text-white">
      <div className="flex min-h-[50vh] w-full flex-col items-stretch justify-center gap-8 rounded-md bg-sky-950 py-8 lg:w-[40em] lg:gap-16">
        <button
          onClick={handleUploadClick}
          className="text-large relative mx-auto h-28 w-28 rounded-full bg-white lg:h-40 lg:w-40"
        >
          <Avatar
            isBordered
            color="default"
            src={currentAvatarUrl || IMAGE_PLACEHOLDER}
            alt="avatar"
            className="text-large h-full w-full"
          />

          <span className="absolute right-1/2 -bottom-4 translate-x-1/2 rounded-full border border-gray-900 bg-white">
            {PLUS_SVG}
          </span>
        </button>

        <input
          ref={uploadRef}
          type="file"
          hidden
          accept=".jpg,.jpeg,.png"
          max={1}
          onChange={handleUpload}
        />

        <div className="mx-auto flex w-full max-w-[400px] flex-col items-stretch px-1">
          <Form onSubmit={handleSubmit} className="flex flex-col items-stretch">
            <div className="flex flex-col items-stretch gap-2">
              <Input
                isRequired
                label="Tên hiển thị"
                placeholder="Nhập tên của bạn..."
                type="text"
                name="display_name"
                autoComplete="off"
              />
              <DatePicker isRequired label="Sinh nhật" className="text-black" name="dob" />
              <Input
                isRequired
                label="Số điện thoại"
                placeholder="090..."
                type="text"
                maxLength={12}
                name="phone"
                autoComplete="off"
              />
            </div>

            <div className="mt-8 flex w-full justify-end">
              <Button type="submit" color="secondary" endContent={<ArrowRightIcon />}>
                Tiếp tục
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
