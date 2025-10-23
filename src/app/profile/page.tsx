"use server";

import Maintenance from "@/components/maintenance";
import React from "react";
import { getCurrentUserInfo } from "../auth/actions";
import { CommonUtils } from "@/utils/common.utils";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Hồ sơ"),
    description: "Thông tin tài khoản HNB",
  };
}

export default async function ProfilePage() {
  const user = await getCurrentUserInfo();

  console.log({ user });
  return <Maintenance />;
}
