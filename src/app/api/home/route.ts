import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    const startOfDay = dayjs().startOf("day").toISOString();
    const endOfDay = dayjs().endOf("day").toISOString();

    const { data: postData } = await supabase
      .from("posts")
      .select("id, slug, title, content, active_at, image, is_hot")
      .gte("active_at", startOfDay)
      .lte("active_at", endOfDay)
      .order("active_at", { ascending: false })
      .limit(1)
      .single();

    const { data: eventData } = await supabase
      .from("events")
      .select("id, slug, title, description, start_at, venue_name, image")
      .eq("is_ended", 0)
      .order("start_at", { ascending: true })
      .limit(1)
      .single();

    const homeData = {
      post: postData || null,
      event: eventData || null,
    };

    return NextResponse.json({ data: homeData, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
