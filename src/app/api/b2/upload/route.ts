import { NextResponse } from "next/server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { b2 } from "@/lib/b2/b2";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const form = await req.formData();

    const files = form.getAll("files") as File[];
    const title = form.get("title") as string;
    const description = form.get("description") as string;
    const folder = form.get("folder") as string | null;

    if (!files || !files.length) {
      return NextResponse.json({ error: "Không tìm thấy file!" }, { status: 400 });
    }

    const bucket = process.env.B2_BUCKET_NAME!;
    const region = process.env.B2_REGION!;

    const uploadedFiles: { url: string; filename: string }[] = [];

    for (const file of files) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const filename = `${folder ? folder + "/" : ""}${Date.now()}-${file.name}`;

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
      .from("upload_images")
      .insert(
        uploadedFiles.map((file) => ({
          title,
          description,
          folder,
          url: file.url,
        }))
      )
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      data,
      uploaded: uploadedFiles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
