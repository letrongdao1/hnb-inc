"use server";

import React from "react";
import { CommonUtils } from "@/utils/common.utils";
import UserProfilePage from "./UserProfilePage";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Hồ sơ"),
    description: "Thông tin tài khoản HNB",
  };
}

export default async function ProfilePage() {
  return <UserProfilePage />;
}
