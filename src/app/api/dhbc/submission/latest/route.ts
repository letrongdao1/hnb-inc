import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const todayDate = CommonUtils.getTodayAsDate();

    const { data, error } = await supabase
      .from("dhbc_quiz_submissions")
      .select("*, quiz!inner(date), user(id, display_name, avatar)")
      .eq("quiz.date", todayDate)
      .order("total_trial", { ascending: true })
      .order("created_at", { ascending: false });

    return NextResponse.json({ data: data || [], status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
