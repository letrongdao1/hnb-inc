import { NextResponse } from "next/server";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { b2 } from "@/lib/b2/b2";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";
import { getCurrentUserId } from "@/app/auth/actions";
import { FileUtils } from "@/utils/file.utils";
import { s3 } from "@/lib/s3/s3";

const bucket = process.env.B2_BUCKET_NAME!;
const region = process.env.B2_REGION!;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    const form = await req.formData();

    const files = form.getAll("files") as File[];
    const folder = (form.get("folder") as string) || "";
    const title = form.get("title") as string;
    const description = form.get("description") as string;

    if (!files || !files.length) {
      return NextResponse.json(
        { error: "Không tìm thấy file!" },
        { status: STATUS_CODE.BAD_REQUEST }
      );
    }

    const uploadedFiles: { url: string; filename: string }[] = [];

    for (const file of files) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const originFileName = file.name.split("/").pop() || file.name;
      const filename = folder
        ? `${folder}/${Date.now()}-${originFileName}`
        : `${Date.now()}-${originFileName}`;

      await b2.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: filename,
          Body: fileBuffer,
          ContentType: file.type,
        })
      );

      const url = `https://${bucket}.s3.${region}.backblazeb2.com/${filename}`;
      uploadedFiles.push({ url, filename });
    }

    const { data, error } = await supabase
      .from("upload_files")
      .insert(
        uploadedFiles.map((file) => ({
          upload_by: userId,
          url: file.url,
          type: FileUtils.detectFileType(file.url),
          folder,
          title,
          description,
        }))
      )
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      data,
      uploaded: uploadedFiles,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    const form = await req.formData();

    const fileUrlListString = form.get("fileUrls") as string;
    const fileUrlList = fileUrlListString.split(",");

    await Promise.all(
      fileUrlList.map(async (url) => {
        if (!url.length) return;

        const { data } = await supabase
          .from("upload_files")
          .select("id, upload_by")
          .eq("url", url)
          .maybeSingle();

        if (!data) return;

        if (data.upload_by && data.upload_by !== userId) {
          return NextResponse.json(
            { error: "Bạn không có quyền thực hiện xóa file này", status: STATUS_CODE.FORBIDDEN },
            { status: STATUS_CODE.FORBIDDEN }
          );
        }

        const filePathArr = new URL(url).pathname.split("/").filter(Boolean);
        filePathArr.shift();
        const filePath = filePathArr.join("/");

        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: filePath,
          })
        );

        const { error } = await supabase.from("upload_files").delete().eq("url", url);
        if (error) {
          return NextResponse.json(
            { error: error.message },
            { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
          );
        }
      })
    );

    return NextResponse.json({
      status: STATUS_CODE.OK,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
    );
  }
}
