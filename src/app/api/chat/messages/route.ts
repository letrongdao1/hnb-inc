import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_MESSAGE_PAGE_SIZE } from "@/constants/constants";
import { STATUS_CODE } from "@/constants/enums";
import { ChatMessage } from "@/interfaces/chat";
import { getCurrentUserId } from "@/app/auth/actions";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    const { searchParams } = new URL(request.url);

    const before = String(searchParams.get("before"));

    if (!Boolean(before)) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select(
        "*, thread:chat_messages_thread_fkey(*), sender:chat_messages_sender_fkey(id, display_name, avatar)"
      )
      .lt("created_at", before)
      .limit(DEFAULT_MESSAGE_PAGE_SIZE)
      .order("created_at", { ascending: true });

    if (error) {
      console.log({ error });
      return NextResponse.json({ data: null, status: STATUS_CODE.NOT_FOUND });
    }

    const parsedData: ChatMessage[] = data?.map((msg) => ({
      ...msg,
      is_mine: msg.sender?.id === userId,
    }));

    return NextResponse.json({ data: parsedData, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
