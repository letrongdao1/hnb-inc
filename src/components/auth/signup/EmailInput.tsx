"use client";

import { checkEmail } from "@/app/auth/actions";
import { ArrowRightIcon, CheckIcon, SendIcon } from "@/components/svg";
import { STATUS_CODE } from "@/constants/enums";
import { CommonUtils } from "@/utils/common.utils";
import {
  addToast,
  Button,
  Input,
  InputOtp,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";

const RESEND_DELAY = 60;

export default function EmailSignupForm({
  email,
  onNext,
}: {
  email: string | null;
  onNext: (email: string) => void;
}) {
  const [emailInput, setEmailInput] = useState(email || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [inputOTP, setInputOTP] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const [resendCounter, setResendCounter] = useState<number>(RESEND_DELAY);
  const [canResend, setCanResend] = useState(false);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    if (email) setIsVerified(true);
  }, [email]);

  useEffect(() => {
    if (!isVerified) return;

    if (email && email !== emailInput) setIsVerified(false);
  }, [emailInput, isVerified, email]);

  const sendEmail = useCallback(async () => {
    return await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput }),
    });
  }, [emailInput]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput) return;

    if (isVerified) {
      onNext(emailInput);
      return;
    }

    setLoading(true);

    try {
      const response = await checkEmail(emailInput);

      if (response.status === STATUS_CODE.CONFLICT) {
        setEmailInput("");
        return addToast({
          title: "Email này đã tồn tại trên HNB Hub. Vui lòng thử đăng nhập lại!",
          color: "danger",
        });
      }

      if (response.status === STATUS_CODE.OK) {
        const otpResponse = await sendEmail();

        if (!otpResponse) return;

        const data = await otpResponse.json();

        if (otpResponse.ok) {
          onOpen();
          addToast({
            title: "Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra email để lấy mã!",
            color: "success",
          });
          handleCountDownResend();
        } else {
          addToast({
            title: data.error || "Không thể gửi mã xác thực. Vui lòng thử lại sau!",
            color: "danger",
          });
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOTP = async (value?: string) => {
    if (!value) return;
    setLoading(true);

    try {
      const verifyResponse = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, otp: value }),
      });

      const data = await verifyResponse.json();

      if (verifyResponse.ok) {
        addToast({
          title: "Xác thực email thành công",
          color: "success",
        });
        setIsVerified(true);
        onNext(emailInput);
      } else {
        const attemptsLeft = data.data ? data.data.attemptsLeft : undefined;
        addToast({
          title: data.error,
          color: "danger",
          description:
            attemptsLeft && Number(attemptsLeft) > 0
              ? `Lần xác thực còn lại: ${attemptsLeft}`
              : undefined,
        });

        if (
          verifyResponse.status !== STATUS_CODE.INVALID_CREDENTIALS ||
          (attemptsLeft && attemptsLeft === 0)
        ) {
          setEmailInput("");
          setInputOTP("");
          onClose();
        }
      }
    } catch (err) {
      console.error(err);
      addToast({
        title: "Đã xảy ra lỗi. Vui lòng thử lại!",
        color: "danger",
      });
    } finally {
      setInputOTP("");
      setLoading(false);
    }
  };

  const handleCountDownResend = () => {
    setResendCounter(RESEND_DELAY);
    setCanResend(false);

    const interval = setInterval(() => {
      setResendCounter((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (!emailInput) return;

    setLoading(true);

    try {
      const otpResponse = await sendEmail();
      const data = await otpResponse.json();

      if (otpResponse.ok) {
        onOpen();
        addToast({
          title: "Mã xác thực đã được gửi lại. Vui lòng kiểm tra email để lấy mã!",
          color: "success",
        });
        handleCountDownResend();
      } else {
        addToast({
          title: data.error || "Không thể gửi mã xác thực. Vui lòng thử lại sau!",
          color: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmitEmail}
        className="mx-auto mt-16 max-w-md space-y-2 rounded-2xl border border-gray-700 p-6 shadow-lg"
      >
        <h2 className="mb-12 text-center text-2xl font-semibold">Tạo tài khoản Nhân viên HNB</h2>

        <Input
          label="Nhập địa chỉ email"
          name="email"
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="staff@hnb.com"
          variant="faded"
          labelPlacement="outside"
          isRequired
        />

        {isVerified && (
          <p className="flex items-center gap-1 text-sm text-green-500">
            <CheckIcon /> Đã xác thực
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          endContent={<ArrowRightIcon width={16} height={16} />}
          color="primary"
          isLoading={loading}
        >
          Tiếp tục
        </Button>

        <p className="mx-auto mt-4 text-center text-sm">
          Đã có tài khoản?{" "}
          <a href="/auth/login" className="text-sky-600 hover:underline">
            Đăng nhập
          </a>
        </p>
      </form>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Xác thực địa chỉ Email</ModalHeader>
              <ModalBody className="space-y-4">
                <p>
                  Vui lòng nhập mã xác thực đã được gửi đến địa chỉ email:{" "}
                  <strong>{CommonUtils.getHiddenEmail(emailInput)}</strong>:
                </p>

                <InputOtp
                  length={6}
                  value={inputOTP}
                  onValueChange={setInputOTP}
                  onComplete={handleCompleteOTP}
                  isDisabled={loading}
                  className="mx-auto"
                />

                <div className="flex w-full items-center justify-end gap-4">
                  <Button onPress={onClose} variant="light">
                    Hủy
                  </Button>
                  <Button
                    onPress={handleResend}
                    isDisabled={!canResend}
                    isLoading={loading}
                    color="primary"
                    startContent={canResend && !loading && <SendIcon size={16} />}
                    className="lg:w-48"
                  >
                    Gửi lại{" "}
                    {!canResend && !loading && `(00:${String(resendCounter).padStart(2, "0")})`}
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
