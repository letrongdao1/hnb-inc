"use server";

import Maintenance from "@/components/maintenance";
import React from "react";
import { getCurrentUserInfo } from "../auth/actions";

export default async function page() {
  const user = await getCurrentUserInfo();

  console.log({ user });
  return <Maintenance />;
}
