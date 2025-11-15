import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("user_streaks")
      .select("*, user:user_streaks_user_id_fkey1(id, display_name, avatar)")
      .eq("user_id", userId)
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
