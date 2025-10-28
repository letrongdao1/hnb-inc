"use server";

import Maintenance from "@/components/maintenance";
import React from "react";
import { getCurrentUserId, getCurrentUserInfo } from "../auth/actions";
import { CommonUtils } from "@/utils/common.utils";
import UserProfilePage from "./UserProfilePage";
import { UserInfo } from "@/interfaces/user";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";
import { BankAccount } from "@/interfaces/common";

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

export async function getUserBankAccounts() {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId)
    return {
      status: STATUS_CODE.INVALID_CREDENTIALS,
      message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
    };

  const { data, error } = await supabase
    .from("bank_accounts")
    .select(
      "id, account_number, account_owner, bank_code, bank_name, bank_short_name, bank_logo, is_selected, created_at"
    )
    .eq("user", userId)
    .order("is_selected", { ascending: false })
    .order("created_at", { ascending: false });

  if (data) {
    return {
      status: STATUS_CODE.OK,
      data: data,
    };
  } else {
    return {
      status: STATUS_CODE.ERROR,
    };
  }
}

export async function createNewBankAccount(data: Partial<BankAccount>) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId)
    return {
      status: STATUS_CODE.INVALID_CREDENTIALS,
      message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
    };

  const { data: checkExistAccount } = await supabase
    .from("bank_accounts")
    .select("id")
    .eq("bank_code", data.bank_code)
    .eq("account_number", data.account_number)
    .eq("account_owner", data.account_owner)
    .maybeSingle();

  if (checkExistAccount)
    return {
      status: STATUS_CODE.CONFLICT,
      message: "Tài khoản đã tồn tại trên hệ thống. Vui lòng sử dụng tài khoản khác!",
    };

  const { data: userAccounts } = await supabase
    .from("bank_accounts")
    .select()
    .eq("user", userId)
    .limit(1);

  console.log({ userAccounts });

  const { error } = await supabase.from("bank_accounts").insert({
    ...data,
    user: userId,
    is_selected: !userAccounts || userAccounts.length === 0,
  });

  return {
    status: error ? STATUS_CODE.ERROR : STATUS_CODE.CREATED,
    message: error ? "Thêm tài khoản lỗi. Vui lòng thử lại sau!" : "Thêm tài khoản thành công.",
  };
}

export async function updateSelectAccount(id: string) {
  if (!id)
    return {
      status: STATUS_CODE.ERROR,
      message: "Không tìm thấy tài khoản!",
    };

  const supabase = await createClient();

  const { data: checkSelected } = await supabase
    .from("bank_accounts")
    .select()
    .eq("is_selected", true)
    .limit(1)
    .maybeSingle();

  const parsedCurrentlySelected = CommonUtils.getSingleDataFromUnknown(checkSelected);

  if (parsedCurrentlySelected) {
    const cjecl = await supabase
      .from("bank_accounts")
      .update({ is_selected: false })
      .eq("id", parsedCurrentlySelected.id)
      .select();
  }

  const { data, error } = await supabase
    .from("bank_accounts")
    .update({ is_selected: true })
    .eq("id", id)
    .select();

  return {
    status: error ? STATUS_CODE.ERROR : STATUS_CODE.OK,
    message: error
      ? "Chọn tài khoản sử dụng không thành công. Vui lòng thử lại sau!"
      : "Đã thay đổi tài khoản sử dụng.",
  };
}

export async function deleteBankAccount(id: string) {
  if (!id)
    return {
      status: STATUS_CODE.ERROR,
      message: "Không tìm thấy tài khoản!",
    };

  const supabase = await createClient();

  const { error } = await supabase.from("bank_accounts").delete().eq("id", id);

  return {
    status: error ? STATUS_CODE.ERROR : STATUS_CODE.OK,
    message: error ? "Xóa tài khoản không thành công. Vui lòng thử lại sau!" : "Đã xóa tài khoản.",
  };
}
