"use client";

import { useEffect, useState } from "react";
import { login } from "../actions";
import { addToast, Button, Form, Input } from "@heroui/react";
import { LoginIcon } from "@/components/svg";
import { STATUS_CODE } from "@/constants/status.enum";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/providers/app-store.provider";

export default function LoginPage() {
  const router = useRouter();
  const { loading, setAuthenticated, setUser, setLoading } = useAppStore((state) => state);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const sessionEmail = sessionStorage.getItem("new-email");
    if (sessionEmail) {
      setForm((prev) => ({
        ...prev,
        email: sessionEmail,
      }));
    }

    console.log({ loading });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return addToast({
        title: "Vui lòng nhập email và mật khẩu!",
        color: "warning",
      });
    }

    if (form.password.length < 6) {
      return addToast({
        title: "Mật khẩu dài ít nhất 6 kí tự!",
        color: "warning",
      });
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
              setAuthenticated(true);
              setUser(response.data);
              router.replace("/");
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
            break;
          }
        }
      }
    } catch {
      console.log("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Form onSubmit={handleSubmit} className="w-full max-w-md space-y-2 rounded-2xl p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-white">Chào mừng đến với HNB Hub</h1>

        {/* Email */}
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="troll@hnb.com"
        />

        {/* Password */}
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
          endContent={<LoginIcon width={16} height={16} />}
          type="submit"
        >
          Đăng nhập
        </Button>

        <p className="mx-auto text-center text-sm text-gray-400">
          Chưa có tài khoản?{" "}
          <a href="/auth/signup" className="text-sky-500 hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </Form>
    </div>
  );
}
