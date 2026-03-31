import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { B2_BUCKET_NAME, B2_REGION } from "@/constants/b2_folder";
import { s3 } from "@/lib/s3/s3";

export async function POST(req: Request) {
  const { filename, folder, contentType } = await req.json();

  const key = folder ? `${folder}/${Date.now()}-${filename}` : `${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const fileUrl = `https://${B2_BUCKET_NAME}.s3.${B2_REGION}.backblazeb2.com/${key}`;

  return NextResponse.json({ uploadUrl, fileUrl, key });
}
