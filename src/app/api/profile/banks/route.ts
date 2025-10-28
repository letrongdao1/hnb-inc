import { STATUS_CODE } from "@/constants/enums";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.vietqr.io/v2/banks");

    if (!response.ok) {
      return NextResponse.json(
        { error: "Không thể lấy danh sách ngân hàng." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: STATUS_CODE.OK });
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi lấy danh sách ngân hàng." },
      { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
    );
  }
}
