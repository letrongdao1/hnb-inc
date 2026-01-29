import { STATUS_CODE } from "@/constants/enums";
import { DHBCUtils } from "@/utils/dhbc.utils";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const nextQuizStartTime = DHBCUtils.getNextStartTime();

  return NextResponse.json({
    data: { now, nextQuizStartTime },
    status: STATUS_CODE.OK,
    error: "Lỗi lấy danh sách tài khoản của người dùng.",
  });
}
