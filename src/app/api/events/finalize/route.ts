import { STATUS_CODE } from "@/constants/enums";
import { EventStatusEnum } from "@/interfaces/events";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const { error } = await supabase
      .from("events")
      .update({ status: EventStatusEnum.FINALIZING })
      .eq("id", eventId);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Bắt đầu tổng kết sự kiện thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Bắt đầu tổng kết sự kiện thành công",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
