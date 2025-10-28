"use client";

import React, { useMemo, useRef, useState } from "react";
import SHINOSUKE_IMAGE from "@/assets/images/profile/shinosuke.jpg";
import QR_PLACEHOLDER_IMAGE from "@/assets/images/profile/qr_placeholder.jpg";
import { Button } from "@heroui/react";
import { EditIcon, UploadIcon } from "../svg";
import Image from "next/image";

export default function QRManagement() {
  const [currentQR, setCurrentQR] = useState<string>(QR_PLACEHOLDER_IMAGE.src);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const isQREmpty = useMemo(() => currentQR === QR_PLACEHOLDER_IMAGE.src, [currentQR]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length) {
      const url = URL.createObjectURL(files[0]);
      setCurrentQR(url);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative z-10 flex aspect-[3/3.6] w-56 rounded-md bg-contain bg-no-repeat lg:w-[30em]"
        style={{ backgroundImage: `url(${SHINOSUKE_IMAGE.src})` }}
      >
        <Image
          src={currentQR}
          alt="qr"
          width={200}
          height={300}
          className={`absolute top-1/2 right-8 z-50 aspect-[3/3] w-24 -translate-y-22 rounded-md object-fill ${isQREmpty && "blur-xs"}`}
        />
      </div>

      <input type="file" hidden onChange={handleUpload} ref={uploadInputRef} />

      <Button
        color={isQREmpty ? "primary" : "default"}
        startContent={isQREmpty ? <UploadIcon /> : <EditIcon />}
        onPress={() => uploadInputRef.current?.click()}
      >
        {isQREmpty ? "Tải QR lên" : "Cập nhật QR"}
      </Button>
    </div>
  );
}
