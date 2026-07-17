"use client";

import { useEffect, useState } from "react";
import { addToast, Button, Form, Input } from "@heroui/react";
import { LoginIcon } from "@/components/svg";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LogoComponent from "@/components/logo/logo";
import { STATUS_CODE } from "@/constants/enums";
import { useUser } from "@/providers/user.provider";
import { login } from "@/app/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectedFrom") ?? "/";
  const [loading, setLoading] = useState<boolean>(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/auth/signup");

    const sessionEmail = sessionStorage.getItem("new-email");
    if (sessionEmail) {
      setForm((prev) => ({
        ...prev,
        email: sessionEmail,
      }));
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      addToast({
        title: "Vui lòng nhập email và mật khẩu!",
        color: "warning",
      });

      return;
    }

    if (form.password.length < 6) {
      addToast({
        title: "Mật khẩu dài ít nhất 6 kí tự!",
        color: "warning",
      });

      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);

      const response = await login(formData);
      if (response && response.status) {
        switch (response.status) {
          case STATUS_CODE.OK: {
            if (response.data) {
              setUser(response.data);
              router.replace(redirectTo || "/");
            } else {
              router.push("/get-start");
            }
            break;
          }
          case STATUS_CODE.INVALID_CREDENTIALS: {
            addToast({
              title: response.message,
              color: "danger",
            });
            setLoading(false);
            break;
          }
          default: {
            throw new Error("Lỗi đăng nhập. Vui lòng liên hệ phòng IT để được hỗ trợ!");
          }
        }
      }
    } catch (err: any) {
      addToast({
        title: err?.message ?? "Lỗi đăng nhập. Vui lòng liên hệ phòng IT để được hỗ trợ!",
        color: "danger",
      });

      setLoading(false);
    }
  };

  return (
    <div className="my-auto flex w-full flex-col items-center justify-center px-2">
      <LogoComponent />

      <Form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col items-stretch space-y-2 rounded-2xl p-4 shadow-lg"
      >
        <h1 className="text-center text-2xl font-bold">Đăng nhập</h1>

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder=""
        />

        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
          placeholder=""
        />

        <Button
          color="primary"
          fullWidth
          isLoading={loading}
          startContent={!loading && <LoginIcon size={16} />}
          type="submit"
        >
          Đăng nhập
        </Button>

        <p className="mx-auto text-center text-sm text-gray-400">
          Chưa có tài khoản?{" "}
          <Link
            href="/auth/signup"
            className="text-sky-500 underline duration-200 hover:brightness-90"
          >
            Đăng ký tài khoản HNB Hub
          </Link>
        </p>
      </Form>
    </div>
  );
}
