"use client";

import { Image } from "@heroui/react";
import React from "react";
import EMPTY_IMAGE from "@/assets/images/empty.png";

export default function EmptyComponent({
  title = "Chưa có dữ liệu",
  description,
  button,
}: {
  title: string;
  description?: string;
  button?: React.ReactNode;
}) {
  return (
    <div
      className={`m-auto flex w-full flex-col items-center justify-start gap-2 px-2 text-center`}
    >
      <Image src={EMPTY_IMAGE.src} alt="empty" className="mb-8 w-64" />
      <p className="text-2xl font-semibold">{title}</p>
      <p className="max-w-xl italic">{description}</p>
      {button}
    </div>
  );
}
