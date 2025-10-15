import { Button } from "@heroui/react";
import React from "react";
import { ArrowLeftIcon } from "../svg";
import { redirect } from "next/navigation";

export default function Forbidden403() {
  return (
    <div className="flex flex-col items-stretch justify-center gap-8 text-center">
      <p className="text-6xl font-bold">
        403 <span className="text-red-600">!</span>
      </p>
      <p>Bạn không có quyền để truy cập trang này.</p>
      <Button onPress={() => redirect("/")} className="mt-4 px-8" startContent={<ArrowLeftIcon />}>
        Quay về trang chủ
      </Button>
    </div>
  );
}
