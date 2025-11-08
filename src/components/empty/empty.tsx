"use client";

import React from "react";
import { FloatIcon, KnotIcon } from "../svg/complex";

export default function EmptyComponent({
  title = "Chưa có dữ liệu",
  description,
  isShowImage = true,
  button,
  margin = 10,
}: {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  isShowImage?: boolean;
  button?: React.ReactNode;
  margin?: number;
}) {
  return (
    <div
      className={`mx-auto mt-[${margin}vh] flex w-full flex-col items-center justify-start gap-2 px-2 text-center`}
    >
      {isShowImage && (
        <div className="mb-4 flex items-center justify-center gap-4">
          <KnotIcon size={150} />
          <FloatIcon size={100} />
        </div>
      )}
      <p className="opacity-75 md:text-lg">{title}</p>
      <p className="max-w-xl italic">{description}</p>
      {button}
    </div>
  );
}
