"use client";

import React from "react";
import { FloatIcon, KnotIcon } from "../svg/complex";

export default function EmptyComponent({
  title = "Chưa có dữ liệu",
  description,
  isShowImage = true,
  imageSize = 100,
  button,
  margin = 10,
}: {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  isShowImage?: boolean;
  imageSize?: number;
  button?: React.ReactNode;
  margin?: number;
}) {
  return (
    <div
      className={`mx-auto mt-[${margin}vh] flex w-full flex-col items-center justify-start gap-2 px-2 text-center`}
    >
      {isShowImage && (
        <div className="mb-4 flex items-center justify-center gap-4">
          <KnotIcon size={imageSize * 1.5} />
          <FloatIcon size={imageSize} />
        </div>
      )}
      <span className="font-light opacity-75">{title}</span>
      <span className="max-w-xl text-xs italic">{description}</span>
      {button}
    </div>
  );
}
