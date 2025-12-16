import { B2_BUCKET_NAME } from "@/constants/b2_folder";
import { b2 } from "@/lib/b2/b2";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { key, uploadId, partNumber } = await req.json();

  const command = new UploadPartCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(b2, command, { expiresIn: 3600 });

  return NextResponse.json({ url });
}