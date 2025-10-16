"use client";

import React from "react";
import { MemberResponse } from "./page";

export default function MembersList({ members }: { members: MemberResponse[] }) {
  console.log({ members });
  return <div>Danh sách </div>;
}
