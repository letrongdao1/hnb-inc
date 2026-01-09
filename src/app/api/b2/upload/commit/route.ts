import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FileUtils } from "@/utils/file.utils";
import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";

export async function POST(req: Request) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const { fileUrl, folder } = await req.json();
  const type = FileUtils.detectFileType(fileUrl);

  const { data, error } = await supabase
    .from("upload_files")
    .insert({
      upload_by: userId,
      url: fileUrl,
      type,
      folder,
    })
    .select("id");

  if (error || !data) {
    console.log({ error });
    return NextResponse.json(
      { message: "Lưu file thất bại!" },
      { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
    );
  }

  return NextResponse.json({ data, url: fileUrl, status: STATUS_CODE.OK });
}
