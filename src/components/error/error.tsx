"use client";

import { Image } from "@heroui/react";
import React from "react";
import ERROR_IMAGE from "@/assets/images/error.png";

export default function ErrorComponent({
  error = "Quá trình lấy thông tin từ máy chủ gặp sự cố. Vui lòng thử lại sau!",
}: {
  error?: string;
}) {
  return (
    <div
      className={`m-auto flex w-full flex-col items-center justify-start gap-2 px-2 text-center`}
    >
      <Image src={ERROR_IMAGE.src} alt="empty" className="mb-8 w-40" />
      <p className="text-2xl font-semibold">Lỗi hệ thống</p>
      <p className="max-w-xl italic">{error}</p>
    </div>
  );
}
