"use client";
import { PasswordValidationProps } from "@/components/auth/signup/PasswordInput";
import { CheckIcon, EyeFilledIcon, EyeSlashFilledIcon, XIcon } from "@/components/svg";
import { Input } from "@heroui/react";
import React, { useState, useEffect } from "react";

const validationRules = [
  { id: "length", text: "Tối thiểu 8 ký tự", regex: /.{8,}/ },
  { id: "number", text: "Tối thiểu 1 ký tự số", regex: /\d/ },
  { id: "lowercase", text: "Tối thiểu 1 ký tự chữ thường", regex: /[a-z]/ },
  { id: "uppercase", text: "Tối thiểu 1 ký tự chữ hoa", regex: /[A-Z]/ },
];

const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
  <li
    className={`flex items-center text-sm transition-colors duration-300 ${isValid ? "text-green-600 dark:text-green-400" : "text-muted-foreground opacity-50"}`}
  >
    {isValid ? <CheckIcon className="mr-2 h-4 w-4" /> : <XIcon className="mr-2 h-4 w-4" />}
    <span>{text}</span>
  </li>
);

const StrongPasswordInput = ({
  password,
  setPassword,
  validationState,
  setValidationState,
}: {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  validationState: PasswordValidationProps;
  setValidationState: React.Dispatch<React.SetStateAction<PasswordValidationProps>>;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPristine, setIsPristine] = useState(true);

  useEffect(() => {
    if (password === "") {
      setIsPristine(true);

      setValidationState({
        length: false,
        number: false,
        lowercase: false,
        uppercase: false,
      });
      return;
    }

    setIsPristine(false);

    const newValidationState = {
      length: validationRules.find((r) => r.id === "length")!.regex.test(password),
      number: validationRules.find((r) => r.id === "number")!.regex.test(password),
      lowercase: validationRules.find((r) => r.id === "lowercase")!.regex.test(password),
      uppercase: validationRules.find((r) => r.id === "uppercase")!.regex.test(password),
    };
    setValidationState(newValidationState);
  }, [password, setValidationState]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Input
          id="password"
          label="Nhập mật khẩu"
          placeholder="Mật khẩu mới"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="faded"
          labelPlacement="outside"
          isRequired
          endContent={
            <button
              aria-label="toggle password visibility"
              className="outline-transparent focus:outline-solid"
              type="button"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeSlashFilledIcon className="text-default-400 pointer-events-none text-2xl" />
              ) : (
                <EyeFilledIcon className="text-default-400 pointer-events-none text-2xl" />
              )}
            </button>
          }
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-start">
          <h3 className="text-sm font-medium">Yêu cầu mật khẩu:</h3>
        </div>
        <ul className="space-y-2">
          {validationRules.map((rule) => (
            <ValidationItem
              key={rule.id}
              isValid={validationState[rule.id as keyof typeof validationState]}
              text={rule.text}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StrongPasswordInput;
