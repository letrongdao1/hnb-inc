"use client";

import { ArrowLeftIcon, CheckIcon, EyeFilledIcon, EyeSlashFilledIcon } from "@/components/svg";
import { useAppStore } from "@/providers/app-store.provider";
import { addToast, Button, Form, Input } from "@heroui/react";
import { useState } from "react";

export default function PasswordSignupForm({
  email,
  setEmail,
  onSubmit,
}: {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string | null>>;
  onSubmit: (password: string, confirmPassword: string) => void;
}) {
  const { loading } = useAppStore((state) => state);

  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleBack = () => {
    setPassword("");
    setConfirmPassword("");
    setEmail(null);
    setIsVisible(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6 || confirmPassword.length < 6) {
      addToast({
        title: "Mật khẩu dài ít nhất 6 kí tự!",
        color: "warning",
      });
    } else if (password !== confirmPassword) {
      addToast({
        title: "Mật khẩu không trùng khớp. Vui lòng thử lại!",
        color: "warning",
      });
    } else {
      onSubmit(password, confirmPassword);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 w-full space-y-4 rounded-2xl border border-gray-700 bg-gray-900 p-6 text-gray-100 shadow-lg sm:w-96"
    >
      <div className="relative mb-8 flex w-full items-center justify-center">
        <div className="absolute top-1/2 left-0 -translate-y-1/2">
          <Button isIconOnly startContent={<ArrowLeftIcon />} onPress={handleBack} />
        </div>
        <div className="space-y-2">
          <h2 className="text-center text-lg font-bold sm:text-xl">Tạo mật khẩu</h2>
          <p className="text-center text-xs text-gray-400 sm:text-sm">
            cho{" "}
            <strong>
              {email.split("@")[0].substring(0, 3)}***@{email.split("@")[1]}
            </strong>
          </p>
        </div>
      </div>

      <Input
        endContent={
          <button
            aria-label="toggle password visibility"
            className="outline-transparent focus:outline-solid"
            type="button"
            onClick={toggleVisibility}
          >
            {isVisible ? (
              <EyeSlashFilledIcon className="text-default-400 pointer-events-none text-2xl" />
            ) : (
              <EyeFilledIcon className="text-default-400 pointer-events-none text-2xl" />
            )}
          </button>
        }
        label="Mật khẩu"
        placeholder="Mật khẩu"
        type={isVisible ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant="faded"
        labelPlacement="outside"
        isRequired
        className="text-black"
      />

      <Input
        endContent={
          <button
            aria-label="toggle password visibility"
            className="outline-transparent focus:outline-solid"
            type="button"
            onClick={toggleVisibility}
          >
            {isVisible ? (
              <EyeSlashFilledIcon className="text-default-400 pointer-events-none text-2xl" />
            ) : (
              <EyeFilledIcon className="text-default-400 pointer-events-none text-2xl" />
            )}
          </button>
        }
        label="Xác nhận mật khẩu"
        placeholder="Xác nhận mật khẩu"
        type={isVisible ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        variant="faded"
        labelPlacement="outside"
        isRequired
        className="text-black"
      />

      <Button
        type="submit"
        color="primary"
        fullWidth
        isLoading={loading}
        startContent={<CheckIcon width={16} height={16} />}
      >
        Hoàn tất
      </Button>
    </Form>
  );
}
