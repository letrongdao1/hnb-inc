"use client";

import React, { useRef, useState } from "react";
import IMAGE_PLACEHOLDER from "@/assets/icons/image-placeholder.svg";
import { addToast, Avatar, Button, DatePicker, Form, Input } from "@heroui/react";
import { CheckIcon, FemaleIcon, MaleIcon, PlusIcon } from "@/components/svg";
import { createUser, uploadAvatar } from "./page";
import { useRouter } from "next/navigation";
import { STATUS_CODE } from "@/constants/enums";
import { useUser } from "@/providers/user.providers";
import { PHONE_NUMBER_REGEX } from "@/constants/regex";

export default function GetStartView({ defaultAvatars }: { defaultAvatars: string[] }) {
  const router = useRouter();
  const { setUser } = useUser();

  const getRandomAvatar = () => {
    return defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
  };

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>(getRandomAvatar());
  const [uploadedFile, setUploadedFile] = useState<File>();
  const [currentGender, setCurrentGender] = useState<"M" | "F">();
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE = 1024 * 1024;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      return addToast({
        title: "Kích thước ảnh quá lớn!",
        description: `Vui lòng chọn ảnh có kích thước tối đa ${Number((MAX_FILE_SIZE / 1024 / 1024).toFixed(1))}MB`,
        color: "warning",
      });
    }

    setCurrentAvatarUrl(URL.createObjectURL(file));
    setUploadedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    if (!currentGender) {
      return addToast({
        title: "Vui lòng chọn giới tính của bạn!",
        color: "warning",
      });
    }

    if (data.phone && !PHONE_NUMBER_REGEX.test(String(data.phone))) {
      return addToast({
        title: "Số điện thoại không hợp lệ. Vui lòng nhập lại!",
        color: "danger",
      });
    }

    setLoading(true);

    try {
      let avatar: string = currentAvatarUrl;
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
      const params = { display_name, phone, dob, avatar, gender: currentGender };

      const response = await createUser(params);
      if (response) {
        switch (response.status) {
          case STATUS_CODE.CREATED: {
            addToast({
              title: response.message,
              color: "success",
            });
            if (response.data) {
              setUser(response.data);
            }
            router.replace("/");
            break;
          }
          case STATUS_CODE.ERROR: {
            addToast({
              title: response.message,
              color: "danger",
            });
            break;
          }
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const uploadRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (uploadRef && uploadRef.current) {
      uploadRef.current.click();
    }
  };

  return (
    <div className="light:border-gray-200 flex min-h-[50vh] w-full flex-col items-stretch justify-center gap-4 rounded-md border py-8 lg:w-[40em] lg:gap-16 dark:border-gray-600">
      <div className="flex flex-col items-stretch gap-2">
        <button
          onClick={handleUploadClick}
          className="text-large relative mx-auto mb-4 h-28 w-28 cursor-pointer rounded-full bg-white duration-200 hover:brightness-75 lg:h-40 lg:w-40"
        >
          <Avatar
            isBordered
            color="default"
            src={currentAvatarUrl || IMAGE_PLACEHOLDER}
            alt="avatar"
            className="text-large h-full w-full"
          />

          <span className="absolute right-1/2 -bottom-4 flex translate-x-1/2 items-center rounded-full border border-gray-900 bg-white px-2">
            <PlusIcon fill="#000" />{" "}
            <p className="text-xs whitespace-nowrap text-gray-900">Nhấn để upload</p>
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

        <div className="mx-auto grid grid-cols-6 items-center justify-center gap-2">
          {defaultAvatars.map((ava, index) => (
            <Avatar
              key={index}
              src={ava}
              alt=""
              isBordered={ava === currentAvatarUrl}
              onClick={() => setCurrentAvatarUrl(ava)}
              className={`cursor-pointer ${ava !== currentAvatarUrl && "brightness-50 hover:brightness-100"} duration-200`}
            />
          ))}
        </div>
        <p className="text-center text-sm italic">Chọn hoặc upload avatar cho riêng bạn!</p>
      </div>

      <div className="mx-auto flex w-full max-w-[400px] flex-col items-stretch px-1">
        <div className="mb-4 flex w-full items-stretch justify-center overflow-hidden rounded-2xl border-2">
          <button
            onClick={() => setCurrentGender("M")}
            className={`flex flex-1 cursor-pointer items-center justify-center border-r p-2 ${currentGender === "M" ? "bg-[#1945D1]" : "opacity-75"} duration-200`}
          >
            <MaleIcon fill={`${currentGender === "M" ? "#FFFFFF" : "#1945D1"}`} />
          </button>
          <button
            onClick={() => setCurrentGender("F")}
            className={`flex flex-1 cursor-pointer items-center justify-center p-2 ${currentGender === "F" ? "bg-[#DE2AD3]" : "opacity-75"} duration-200`}
          >
            <FemaleIcon fill={`${currentGender === "F" ? "#FFFFFF" : "#DE2AD3"}`} />
          </button>
        </div>

        <Form onSubmit={handleSubmit} className="flex flex-col items-stretch">
          <div className="flex flex-col items-stretch gap-2">
            <Input
              isRequired
              label="Tên hiển thị"
              placeholder="Nhập tên của bạn..."
              type="text"
              name="display_name"
              autoComplete="off"
              maxLength={50}
            />

            <DatePicker isRequired label="Sinh nhật" name="dob" showMonthAndYearPickers />

            <Input
              isRequired
              label="Số điện thoại"
              placeholder="Nhập số điện thoại..."
              type="text"
              minLength={10}
              maxLength={11}
              name="phone"
              autoComplete="off"
            />
          </div>

          <div className="mt-8 flex w-full justify-end">
            <Button
              type="submit"
              color="success"
              fullWidth
              startContent={!loading && <CheckIcon size={16} />}
              isLoading={loading}
            >
              Hoàn tất
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
