import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/app/auth/actions";
import { NOTIFICATION_TYPE, STATUS_CODE } from "@/constants/enums";
import { Event } from "@/interfaces/events";
import { DEFAULT_PAGE_SIZE } from "@/constants/constants";
import { CommonUtils } from "@/utils/common.utils";
import { notifyAllActiveUser } from "@/lib/notifications/notifications";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageIndex = parseInt(searchParams.get("pageIndex") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10);

    const supabase = await createClient();
    const userId = await getCurrentUserId();

    const from = (pageIndex - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from("events")
      .select("*, will_pay_user:events_will_pay_user_fkey(id, display_name, avatar)", {
        count: "exact",
      })
      .range(from, to)
      .order("status", { ascending: true })
      .order("start_at", { ascending: true });

    if (error || !data) {
      console.error("Error fetching events:", error);
      return NextResponse.json({ error: "Lỗi lấy danh sách sự kiện!" }, { status: 500 });
    }

    const parsedData = data.map((event) => ({
      ...event,
      will_pay_user: CommonUtils.getSingleDataFromUnknown(event.will_pay_user),
      is_will_pay_user: event.will_pay_user?.id === userId,
    }));

    return NextResponse.json({ data: parsedData, count: count, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const params: Partial<Event> = await req.json();

    const { data, error } = await supabase.from("events").insert(params).select("*").maybeSingle();

    if (error) {
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Tạo thông tin sự kiện thất bại. Vui lòng thử lại sau!",
      });
    }

    notifyAllActiveUser({
      supabase,
      title: "SỰ KIỆN HNB MỚI",
      description: data.title,
      href: `/events/${data.slug}`,
      type: NOTIFICATION_TYPE.EVENT,
      from_user: userId,
      ref_id: data.id,
    });

    return NextResponse.json({
      status: STATUS_CODE.CREATED,
      message: "Tạo sự kiện thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const data: Partial<Event> = await request.json();

    delete data["is_will_pay_user"];

    const { error } = await supabase.from("events").update(data).eq("id", data.id);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Cập nhật sự kiện thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Cập nhật sự kiện thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Xóa sự kiện thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Xóa sự kiện thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
