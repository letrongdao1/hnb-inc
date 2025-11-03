import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("id", { ascending: false });

    if (error || !data) {
      console.error("Error fetching event hashtags:", error);
      return NextResponse.json({ error: "Lỗi lấy danh sách hashtag!" }, { status: 500 });
    }

    return NextResponse.json({ data, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
