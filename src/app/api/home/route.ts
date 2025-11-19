import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const startOfDayLocal = new Date(new Date());
    startOfDayLocal.setHours(0, 0, 0, 0);
    const startOfDayUTC = new Date(startOfDayLocal.getTime() - 7 * 60 * 60 * 1000);

    const endOfDayLocal = new Date(new Date());
    endOfDayLocal.setHours(23, 59, 59, 999);
    const endOfDayUTC = new Date(endOfDayLocal.getTime() - 7 * 60 * 60 * 1000);

    const { data: postData } = await supabase
      .from("posts")
      .select("id, slug, title, content, active_at, image, is_hot")
      .gte("active_at", startOfDayUTC.toISOString())
      .lte("active_at", endOfDayUTC.toISOString())
      .order("active_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: eventData } = await supabase
      .from("events")
      .select("id, slug, title, description, start_at, venue_name, image")
      .eq("is_ended", 0)
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle();

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
