import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";

export async function GET(_: any, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("chat_messages")
      .select(
        "*, thread:chat_messages_thread_fkey(*), sender:chat_messages_sender_fkey(id, display_name, avatar)"
      )
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.log({ error });
      return NextResponse.json({ data: null, status: STATUS_CODE.NOT_FOUND });
    }

    return NextResponse.json({ data, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
