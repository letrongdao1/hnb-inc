"use client";

import { Image } from "@heroui/react";
import React from "react";
import EMPTY_IMAGE from "@/assets/images/empty.png";

export default function EmptyComponent({
  title = "Chưa có dữ liệu",
  description,
  imageSrc = EMPTY_IMAGE.src,
  isShowImage = true,
  button,
  margin = 10,
}: {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  imageSrc?: string;
  isShowImage?: boolean;
  button?: React.ReactNode;
  margin?: number;
}) {
  return (
    <div
      className={`m-auto mt-[${margin}vh] flex w-full flex-col items-center justify-start gap-2 px-2 text-center`}
    >
      {isShowImage && <Image src={imageSrc} alt="empty" className="mb-8 w-64" />}
      <p className="text-2xl font-semibold">{title}</p>
      <p className="max-w-xl italic">{description}</p>
      {button}
    </div>
  );
}
