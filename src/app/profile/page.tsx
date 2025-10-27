"use server";

import Maintenance from "@/components/maintenance";
import React from "react";
import { getCurrentUserId, getCurrentUserInfo } from "../auth/actions";
import { CommonUtils } from "@/utils/common.utils";
import UserProfilePage from "./UserProfilePage";
import { UserInfo } from "@/interfaces/user";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Hồ sơ"),
    description: "Thông tin tài khoản HNB",
  };
}

export default async function ProfilePage() {
  return <UserProfilePage />;
}

export async function updateUserAccountInfo(data: Partial<UserInfo>) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId)
    return {
      status: STATUS_CODE.INVALID_CREDENTIALS,
      message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
    };

  const { error } = await supabase.from("users").update(data).eq("id", userId);

  if (!error) {
    const user = await getCurrentUserInfo();

    return user
      ? { status: STATUS_CODE.OK, data: user, message: "Cập nhật thông tin tài khoản thành công" }
      : { status: STATUS_CODE.NOT_FOUND, message: "Lỗi lấy thông tin tài khoản!" };
  }
}
