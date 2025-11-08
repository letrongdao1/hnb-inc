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

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json({ error: "Không tìm thấy file url!" }, { status: 400 });
    }

    const match = fileUrl.match(/\/object\/public\/([^/]+)\/(.+)$/);

    if (!match) {
      return NextResponse.json({ error: "File URL không hợp lệ" }, { status: 400 });
    }

    const folder = "upload";
    const bucketName = match[1];
    const filePath = match[2];
    const fileName = filePath.split("/").pop();

    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list(folder, { search: fileName });

    if (listError) {
      console.error("List error:", listError);
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const exists = files?.some((f) => f.name === fileName);

    if (!exists) {
      return NextResponse.json({
        message: `File "${fileName}" not found in ${folder}/`,
        skipped: true,
      });
    }

    const { data, error } = await supabase.storage.from(bucketName).remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
    }

    return NextResponse.json({ message: "File deleted successfully", data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
