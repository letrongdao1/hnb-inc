import { getCurrentUserId } from "@/app/auth/actions";
import { B2_BUCKET_NAME, B2_REGION } from "@/constants/b2_folder";
import { STATUS_CODE } from "@/constants/enums";
import { b2 } from "@/lib/b2/b2";
import { createClient } from "@/lib/supabase/server";
import { FileUtils } from "@/utils/file.utils";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const { key, uploadId, parts, folder } = await req.json();

  await b2.send(
    new CompleteMultipartUploadCommand({
      Bucket: B2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    })
  );

  const url = `https://${B2_BUCKET_NAME}.s3.${B2_REGION}.backblazeb2.com/${key}`;
  const fileType = FileUtils.detectFileType(url);

  const { data, error } = await supabase
    .from("upload_files")
    .insert({
      upload_by: userId,
      url,
      blurHash: null,
      type: fileType,
      folder,
    })
    .select();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
    );
  }

  return NextResponse.json({ data, url });
}
