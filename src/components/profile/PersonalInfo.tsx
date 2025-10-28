"use client";

import { UserInfo } from "@/interfaces/user";
import React, { useMemo, useState } from "react";
import { Input, Button, Spacer, DatePicker, Select, SelectItem, addToast } from "@heroui/react";
import { CheckIcon, EditIcon } from "../svg";
import { parseDate } from "@internationalized/date";
import { updateUserAccountInfo } from "@/app/profile/page";
import { useUser } from "@/providers/user.providers";

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
    if (user && (displayName != user.display_name || phone != user.phone || dob != user.dob))
      return true;

    return false;
  }, [user, displayName, phone, dob]);

  const handleSubmit = async () => {
    if (!isChanged) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        display_name: displayName,
        phone,
        dob,
      };

      await updateUserAccountInfo(updateData)
        .then((res) => {
          if (res?.data) {
            console.log({ data: res.data });
            setUser(res.data);
            addToast({
              title: res.message,
              color: "success",
            });
          } else {
            addToast({
              title: res?.message,
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
    <div className="flex w-full md:max-w-2xl flex-col gap-4 rounded-xl p-6 shadow-sm">
      <Input label="Email" value={email} isDisabled />

      <Select label="Giới tính" selectedKeys={[gender]} isDisabled>
        <SelectItem key="M">Nam</SelectItem>
        <SelectItem key="F">Nữ</SelectItem>
      </Select>

      <Input
        label="Tên hiển thị"
        placeholder="Tên hiển thị"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        isReadOnly={!isEditing}
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
      />

      <Spacer y={1} />

      <Button
        color={isEditing ? "primary" : "default"}
        onPress={() => {
          if (isEditing) handleSubmit();
          else setIsEditing(true);
        }}
        isLoading={isLoading}
        fullWidth
        startContent={isEditing ? <CheckIcon /> : <EditIcon />}
      >
        {isEditing ? "Lưu thay đổi" : "Cập nhật"}
      </Button>
    </div>
  );
}
