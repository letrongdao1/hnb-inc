"use client";

import { Button, Image } from "@heroui/react";
import React from "react";
import DETECTIVE from "@/assets/images/detective.jpg";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/svg";

export default function NotFoundPage() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="m-auto flex w-full flex-col items-center justify-start gap-2 px-2 text-center">
      <Image shadow="lg" src={DETECTIVE.src} alt="detective" className="mb-8 w-64 rounded-xl" />
      <p className="text-2xl">
        KHÔNG TÌM THẤY TRANG <span className="ml-2 text-3xl font-bold">{pathname}</span>
      </p>
      <p className="italic">
        &quot;Don&apos;t worry! We&apos;ve got our best man on the case.&quot;
      </p>
      <Button onPress={() => router.back()} className="mt-4 px-8" startContent={<ArrowLeftIcon />}>
        Quay lại
      </Button>
    </div>
  );
}
