"use client";

import { checkEmail, sendVerificationCode } from "@/app/auth/actions";
import { ArrowRightIcon } from "@/components/svg";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/client";
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
import { useState } from "react";

export default function EmailSignupForm({ onNext }: { onNext: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [inputOTP, setInputOTP] = useState<string>("");
  const [currentGeneratedOTP, setCurrentGeneratedOTP] = useState<string>();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      const response = await checkEmail(email);

      if (response.status === STATUS_CODE.CONFLICT) {
        setEmail("");
        return addToast({
          title: "Email này đã tồn tại trên HNB Hub. Vui lòng thử đăng nhập lại!",
          color: "danger",
        });
      } else if (response.status === STATUS_CODE.OK) {
        const newOTP = CommonUtils.generateRandomCode();
        setCurrentGeneratedOTP(newOTP);
        const sendEmailResponse = await sendVerificationCode({ email, code: newOTP });
        if (sendEmailResponse.status === STATUS_CODE.OK) {
          onOpen();
        } else {
          addToast({
            title: "Gửi email lỗi. Vui lòng thử lại sau!",
            color: "danger",
          });
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOTP = (value?: string) => {
    if (!value) return;

    setLoading(true);

    setTimeout(() => {
      if (currentGeneratedOTP === value) {
        onNext(email);
      } else {
        addToast({
          title: "Mã OTP không đúng, vui lòng kiểm tra lại email!",
        });
      }

      setInputOTP("");
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-16 max-w-md space-y-2 rounded-2xl border border-gray-700 bg-inherit p-6 text-inherit shadow-lg"
      >
        <h2 className="mb-12 text-center text-2xl font-semibold">Tạo tài khoản Nhân viên HNB</h2>

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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Xác thực địa chỉ Email</ModalHeader>
              <ModalBody className="space-y-4">
                <p>
                  Vui lòng nhập mã xác thực đã được gửi đến địa chỉ email:{" "}
                  <strong>{CommonUtils.getHiddenEmail(email)}</strong>:
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
                  <Button color="secondary">Gửi lại (00:60)</Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
