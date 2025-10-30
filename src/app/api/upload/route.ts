import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { fileBase64, fileName } = await req.json();

    if (!fileBase64) {
      return NextResponse.json({
        status: STATUS_CODE.BAD_REQUEST,
        message: "Không tìm thấy file!",
      });
    }

    const match = fileBase64.match(/^data:(image\/\w+);base64,/);
    if (!match) {
      return NextResponse.json({
        status: STATUS_CODE.BAD_REQUEST,
        message: "File không đúng định dạng!",
      });
    }

    const mimeType = match[1];
    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const newFileName = `${Date.now()}_${fileName}`;

    const { error } = await supabase.storage
      .from("avatar")
      .upload(`upload/${newFileName}`, buffer, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return NextResponse.json({
        status: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Lỗi không xác định. Vui lòng thử lại sau!",
      });
    }

    const urlData = supabase.storage.from("avatar").getPublicUrl(`upload/${newFileName}`);
    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Tải ảnh lên thành công.",
      data: urlData.data.publicUrl,
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
