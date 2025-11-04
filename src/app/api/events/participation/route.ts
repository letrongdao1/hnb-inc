import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { CommonUtils } from "@/utils/common.utils";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy sự kiện. Vui lòng thử lại sau!",
      });
    }

    const { error } = await supabase
      .from("event_participation")
      .insert({
        user: userId,
        event: eventId,
      })
      .select("*, user:users(id, display_name, avatar)")
      .maybeSingle();

    if (error) {
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Đăng ký tham gia sự kiện thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Đăng ký tham gia sự kiện thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy sự kiện. Vui lòng thử lại sau!",
      });
    }

    const { error } = await supabase.from("event_participation").delete().eq("event", eventId);

    if (error) {
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Hủy đăng ký tham gia sự kiện thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Hủy đăng ký tham gia sự kiện thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
