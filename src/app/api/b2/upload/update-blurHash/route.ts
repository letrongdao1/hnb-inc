import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";

export async function PUT(req: Request) {
  const supabase = await createClient();

  const { blurHash, id } = await req.json();

  await supabase.from("upload_files").update({ blurHash }).eq("id", id);

  return NextResponse.json({ status: STATUS_CODE.OK });
}
