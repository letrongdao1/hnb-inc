import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) return;

    const { error } = await supabase
      .from("users")
      .update({ last_active: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.log({ error });
      return NextResponse.json({ status: STATUS_CODE.ERROR });
    }

    console.log("last-active");

    return NextResponse.json({ status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
