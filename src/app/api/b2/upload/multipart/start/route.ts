import { STATUS_CODE } from "@/constants/enums";
import { b2 } from "@/lib/b2/b2";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const bucket = process.env.B2_BUCKET_NAME!;

export async function POST(req: Request) {
  const form = await req.formData();
  const fileName = (form.get("fileName") as string) || "";
  const folder = (form.get("folder") as string) || "";
  const fileType = (form.get("fileType") as string) || "";

  if (!fileName) {
    return NextResponse.json(
      { error: "Không tìm thấy file!" },
      { status: STATUS_CODE.BAD_REQUEST }
    );
  }

  const originFileName = fileName.split("/").pop() || "";
  const filename = folder
    ? `${folder}/${Date.now()}-${originFileName}`
    : `${Date.now()}-${originFileName}`;

  const res = await b2.send(
    new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: filename,
      ContentType: fileType,
    })
  );

  return NextResponse.json({
    uploadId: res.UploadId,
    key: filename,
  });
}
