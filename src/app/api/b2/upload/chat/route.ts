import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { b2 } from "@/lib/b2/b2";
import { STATUS_CODE } from "@/constants/enums";
import { B2_BUCKET_NAME, B2_REGION } from "@/constants/b2_folder";

const folder = "HNB_TALK";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (!files || !files.length) {
      return NextResponse.json(
        { error: "Không tìm thấy file!" },
        { status: STATUS_CODE.BAD_REQUEST }
      );
    }

    const urlList = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${folder}/${Date.now()}-${file.name}`;

        await b2.send(
          new PutObjectCommand({
            Bucket: B2_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
          })
        );

        return `https://${B2_BUCKET_NAME}.s3.${B2_REGION}.backblazeb2.com/${filename}`;
      })
    );

    return NextResponse.json({
      data: urlList,
      status: STATUS_CODE.OK,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || `Upload failed to ${folder}` },
      { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
    );
  }
}
