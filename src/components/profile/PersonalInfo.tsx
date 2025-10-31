"use client";

import { UserInfo } from "@/interfaces/user";
import React, { useMemo, useState } from "react";
import { Input, Button, Spacer, DatePicker, Select, SelectItem, addToast } from "@heroui/react";
import { CheckIcon, EditIcon, XIcon } from "../svg";
import { parseDate } from "@internationalized/date";
import { useUser } from "@/providers/user.providers";
import { PHONE_NUMBER_REGEX } from "@/constants/regex";

interface PersonalInfoProps {
  user: UserInfo | null;
}

export default function PersonalInfo({ user }: PersonalInfoProps) {
  const { setUser } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email] = useState(user?.email ?? "");
  const [gender] = useState(user?.gender ?? "M");
  const [dob, setDob] = useState(user?.dob ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const isChanged = useMemo(() => {
    return user && (displayName != user.display_name || phone != user.phone || dob != user.dob);
  }, [user, displayName, phone, dob]);

  const handleSubmit = async () => {
    if (!isChanged || !user) {
      setIsEditing(false);
      return;
    }

    if (!PHONE_NUMBER_REGEX.test(phone)) {
      return addToast({
        title: "Số điện thoại không hợp lệ. Vui lòng nhập lại!",
        color: "danger",
      });
    }

    setIsLoading(true);
    try {
      const updateData = {
        display_name: displayName,
        phone,
        dob,
      };

      await fetch("/api/profile/info", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.data) {
            setUser(result.data);
            addToast({
              title: result.message,
              color: "success",
            });
          } else {
            addToast({
              title: result.message,
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Cập nhật thông tin lỗi",
            color: "danger",
          });
        });
    } catch {
    } finally {
      setIsEditing(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-stretch gap-2 rounded-xl p-6 shadow-sm md:max-w-2xl">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row">
        <Input label="Email" value={email} isDisabled className="flex-2" />

        <Select label="Giới tính" selectedKeys={[gender]} isDisabled className="flex-1">
          <SelectItem key="M">Nam</SelectItem>
          <SelectItem key="F">Nữ</SelectItem>
        </Select>
      </div>

      <Input
        label="Tên hiển thị"
        placeholder="Tên hiển thị"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        isReadOnly={!isEditing}
        maxLength={80}
      />

      <Input
        label="Số điện thoại"
        placeholder="Nhập số điện thoại"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        isReadOnly={!isEditing}
      />

      <DatePicker
        label="Ngày sinh"
        value={dob ? parseDate(dob) : undefined}
        onChange={(date) => setDob(date?.toString() ?? "")}
        isReadOnly={!isEditing}
        showMonthAndYearPickers
      />

      <Spacer y={1} />

      <div className="flex items-stretch gap-2">
        <Button
          color={isEditing ? "success" : "primary"}
          variant={isEditing ? "solid" : "flat"}
          onPress={() => {
            if (isEditing) handleSubmit();
            else setIsEditing(true);
          }}
          isLoading={isLoading}
          fullWidth
          startContent={isLoading ? null : isEditing ? <CheckIcon /> : <EditIcon />}
          className="flex-8"
        >
          {isEditing ? "Lưu thay đổi" : "Cập nhật"}
        </Button>

        {isEditing && (
          <Button
            isIconOnly
            startContent={<XIcon size={16} />}
            variant="bordered"
            color="danger"
            onPress={() => setIsEditing(false)}
            className="flex-1"
          />
        )}
      </div>
    </div>
  );
}
