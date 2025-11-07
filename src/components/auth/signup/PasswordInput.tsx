"use client";

import { ArrowLeftIcon, CheckIcon, EyeFilledIcon, EyeSlashFilledIcon } from "@/components/svg";
import StrongPasswordInput from "@/components/ui/password-input/StrongPasswordInput";
import { CommonUtils } from "@/utils/common.utils";
import { addToast, Button, Form, Input } from "@heroui/react";
import { useMemo, useState } from "react";

export interface PasswordValidationProps {
  length: boolean;
  number: boolean;
  lowercase: boolean;
  uppercase: boolean;
}

export default function PasswordSignupForm({
  email,
  setStep,
  onSubmit,
  loading,
}: {
  email: string | null;
  setStep: React.Dispatch<React.SetStateAction<1 | 2>>;
  onSubmit: (password: string, confirmPassword: string) => void;
  loading: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [validationState, setValidationState] = useState<PasswordValidationProps>({
    length: false,
    number: false,
    lowercase: false,
    uppercase: false,
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const isPasswordInvalid = useMemo(() => {
    return Object.values(validationState).some((v) => v === false);
  }, [validationState]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleBack = () => {
    setPassword("");
    setConfirmPassword("");
    setIsVisible(false);
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordInvalid) {
      addToast({
        title: "Mật khẩu không phù hợp. Vui lòng tạo mật khẩu theo yêu cầu!",
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
      className="m-auto w-full space-y-4 rounded-2xl border border-gray-700 p-6 shadow-lg md:w-2/3 lg:w-1/2"
    >
      <div className="relative mb-8 flex w-full items-center justify-center">
        <div className="absolute top-1/2 left-0 -translate-y-1/2">
          <Button isIconOnly startContent={<ArrowLeftIcon />} onPress={handleBack} />
        </div>
        <div className="space-y-2">
          <h2 className="text-center text-lg font-bold sm:text-xl">Tạo mật khẩu</h2>
          <p className="text-center text-xs text-gray-400 sm:text-sm">
            cho <strong>{CommonUtils.getHiddenEmail(email || "")}</strong>
          </p>
        </div>
      </div>

      <StrongPasswordInput
        password={password}
        setPassword={setPassword}
        validationState={validationState}
        setValidationState={setValidationState}
      />

      <Input
        label="Xác nhận mật khẩu"
        placeholder="Xác nhận mật khẩu"
        type={isVisible ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        variant="faded"
        labelPlacement="outside"
        isRequired
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
      />

      <Button
        type="submit"
        color="primary"
        fullWidth
        isLoading={loading}
        startContent={!loading && <CheckIcon size={16} />}
      >
        Hoàn tất
      </Button>
    </Form>
  );
}
