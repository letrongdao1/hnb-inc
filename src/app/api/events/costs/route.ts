import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) return;

    const supabase = await createClient();

    const { data, count, error } = await supabase
      .from("event_costs")
      .select("*, user: users(id, display_name, avatar)", { count: "exact" })
      .eq("event", eventId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching event costs:", error);
      return NextResponse.json({ error: "Lỗi lấy danh sách chi phí sự kiện!" }, { status: 500 });
    }

    return NextResponse.json({ data, count, status: STATUS_CODE.OK });
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

    const data = await req.json();

    const params = {
      ...data,
      user: userId,
    };

    const { error } = await supabase.from("event_costs").insert(params);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Thêm chi phí sự kiện thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.CREATED,
      message: "Thêm chi phí sự kiện thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
