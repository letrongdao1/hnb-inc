"use client";
import Image from "next/image";
import React, { useRef } from "react";
import IMAGE_PLACEHOLDER from "@/assets/icons/image-placeholder.svg";
import { Input } from "antd";

const PLUS_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#000">
    <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
  </svg>
);

export default function GetStart() {
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (uploadRef && uploadRef.current) {
      uploadRef.current.click();
    }
  };
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 text-white">
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-16 rounded-md bg-sky-950 lg:w-90">
        <button onClick={handleUploadClick} className="relative rounded-lg bg-white p-16">
          <Image src={IMAGE_PLACEHOLDER} alt="placeholder" />

          <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-900 bg-white">
            {PLUS_SVG}
          </span>
        </button>
        <input ref={uploadRef} type="file" hidden accept=".jpg,.jpeg,.png" />

        <div className="flex w-full max-w-[300px] flex-col items-start gap-1 px-1">
          <p className="text-sm">Nhập tên hiển thị của bạn:</p>
          <Input placeholder="Tên hiển thị..." className="w-full" />

          <div className="mt-8 flex w-full justify-end">
            <button className="text-sm flex items-center gap-2 rounded-md bg-white px-2 py-1 text-black">
              Tiếp tục{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
