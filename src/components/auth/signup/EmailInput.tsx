"use client";

import { checkEmail } from "@/app/auth/actions";
import { STATUS_CODE } from "@/app/constants/status";
import { ArrowRightIcon } from "@/components/svg";
import { useAppStore } from "@/lib/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { addToast, Button, Input } from "@heroui/react";
import { useState } from "react";

export default function EmailSignupForm({ onNext }: { onNext: (email: string) => void }) {
  const supabase = createClient();
  const { loading, setLoading } = useAppStore();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      onNext(email);
      // const response = await checkEmail(email);

      // if (response.status === STATUS_CODE.CONFLICT) {
      //   setEmail("");
      //   return addToast({
      //     title: "Email này đã tồn tại trên HNB Hub. Vui lòng thử đăng nhập lại!",
      //     color: "danger",
      //   });
      // } else if (response.status === STATUS_CODE.OK) {
      //   onNext(email);
      // }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-16 max-w-sm space-y-2 rounded-2xl border border-gray-700 bg-gray-900 p-6 text-gray-100 shadow-lg"
    >
      <h2 className="mb-12 text-center text-xl font-semibold">Tạo tài khoản Nhân viên HNB</h2>

      <Input
        label="Nhập địa chỉ email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="troll@hnb.com"
        variant="faded"
        labelPlacement="outside"
        isRequired
        className="text-black"
      />

      <Button
        type="submit"
        fullWidth
        endContent={<ArrowRightIcon width={16} height={16} />}
        color="primary"
        isLoading={loading}
      >
        Tiếp tục
      </Button>

      <p className="mx-auto text-center text-sm text-gray-500">
        Đã có tài khoản?{" "}
        <a href="/auth/login" className="text-sky-600 hover:underline">
          Đăng nhập
        </a>
      </p>
    </form>
  );
}
