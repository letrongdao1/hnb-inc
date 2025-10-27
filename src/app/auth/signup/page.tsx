"use client";

import { useState } from "react";
import { signup } from "../actions";
import EmailSignupForm from "@/components/auth/signup/EmailInput";
import PasswordSignupForm from "@/components/auth/signup/PasswordInput";
import { addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { STATUS_CODE } from "@/constants/enums";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignUp = async (password: string) => {
    if (!email || !password) return;

    if (password.length < 6) {
      return addToast({
        title: "Mật khẩu dài ít nhất 6 kí tự!",
        color: "warning",
      });
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const res = await signup(formData);
      if (res && res.status === STATUS_CODE.OK) {
        sessionStorage.setItem("new-email", email);
        addToast({
          title: res.message,
          color: "success",
        });
        router.replace("/auth/login");
      }
    } catch {
      setEmail(null);
      addToast({
        title: "Tạo tài khoản thất bại. Vui lòng thử lại!",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      {!email ? (
        <EmailSignupForm onNext={(value) => setEmail(value)} />
      ) : (
        <PasswordSignupForm
          email={email}
          setEmail={setEmail}
          onSubmit={handleSignUp}
          loading={loading}
        />
      )}
    </div>
  );
}
