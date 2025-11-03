import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";
import { getPublicUserList } from "@/app/auth/users";

export async function GET() {
  try {
    const supabase = await createClient();

    const tagUsers = await getPublicUserList(supabase);

    return NextResponse.json({ data: tagUsers, count: tagUsers.length, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
