"use client";

import React from "react";
import MAINTENANCE_IMAGE from "@/assets/images/maintenance.jpg";
import { Button, Image, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../svg";

export default function Maintenance() {
  const router = useRouter();

  return (
    <div className="m-auto flex w-full flex-col items-center justify-start gap-2 px-2 text-center">
      <Image
        shadow="lg"
        src={MAINTENANCE_IMAGE.src}
        alt="detective"
        className="mb-8 w-64 rounded-full"
      />
      <p className="text-2xl font-semibold">ĐANG PHÁT TRIỂN...</p>
      <p className="italic max-w-xl">
        Chức năng đang được bộ phận IT phát triển để đem đến cho HNB trải nghiệm tốt nhất.
      </p>
      <Button onPress={() => router.back()} className="mt-4 px-8" startContent={<ArrowLeftIcon />}>
        Quay lại
      </Button>
    </div>
  );
}
