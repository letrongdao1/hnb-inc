import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("top_banners")
      .select("*")
      .lte("active_at", now)
      .or(`expired_at.gte.${now},expired_at.is.null`)
      .order("active_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log({ error });
      return NextResponse.json({ data: null, status: STATUS_CODE.NOT_FOUND });
    }

    return NextResponse.json({ data, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
