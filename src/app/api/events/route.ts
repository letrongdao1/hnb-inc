import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, getCurrentUserInfo } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { Event } from "@/interfaces/events";
import { DEFAULT_PAGE_SIZE } from "@/constants/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageIndex = parseInt(searchParams.get("pageIndex") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10);

    const supabase = await createClient();

    const from = (pageIndex - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from("events")
      .select("*", { count: "exact" })
      .range(from, to)
      .order("start_date", { ascending: false });

    if (error || !data) {
      console.error("Error fetching events:", error);
      return NextResponse.json({ error: "Lỗi lấy danh sách sự kiện!" }, { status: 500 });
    }

    return NextResponse.json({ data, count: count, status: STATUS_CODE.OK });
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

    const data: Partial<Event> = await req.json();

    const { error } = await supabase.from("events").insert(data);

    if (error) {
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Tạo thông tin sự kiện thất bại. Vui lòng thử lại sau!",
      });
    }

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
