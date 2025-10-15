"use client";

import React from "react";
import MAINTENANCE_IMAGE from "@/assets/images/maintenance.jpg";
import { Button, Image } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/svg";

export default function Maintenance({ showBackButton = true }: { showBackButton?: boolean }) {
  const router = useRouter();

  return (
    <div
      className={`${showBackButton && "m-auto"} flex w-full flex-col items-center justify-start gap-2 px-2 text-center`}
    >
      <Image src={MAINTENANCE_IMAGE.src} alt="detective" className="mb-8 w-64 rounded-full" />
      <p className="text-2xl font-semibold">ĐANG PHÁT TRIỂN...</p>
      <p className="max-w-xl italic">
        Chức năng đang được bộ phận IT phát triển để đem đến cho HNB trải nghiệm tốt nhất.
      </p>
      {showBackButton && (
        <Button
          variant="flat"
          onPress={() => router.back()}
          className="mt-4 px-8 text-inherit"
          startContent={<ArrowLeftIcon />}
        >
          Quay lại
        </Button>
      )}
    </div>
  );
}
