import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { STATUS_CODE } from "@/constants/enums";
import { s3 } from "@/lib/s3/s3";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const folder = searchParams.get("folder") ?? "";
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Number(searchParams.get("limit") ?? 30);

    const command = new ListObjectsV2Command({
      Bucket: process.env.B2_BUCKET_NAME!,
      Prefix: folder ? `${folder}/` : undefined,
      MaxKeys: limit,
      ContinuationToken: cursor,
    });

    const result = await s3.send(command);

    const files =
      result.Contents?.map((item) => {
        const fileKey = item.Key!;
        const fileName = fileKey.split("/").pop();

        const s3Url = `https://s3.${process.env.B2_REGION}.backblazeb2.com/${process.env.B2_BUCKET_NAME}/${fileKey}`;

        return {
          fileName,
          fileKey,
          url: s3Url,
          size: item.Size,
          lastModified: item.LastModified,
        };
      }) ?? [];

    return NextResponse.json(
      {
        data: files,
        nextCursor: result.NextContinuationToken ?? null,
        hasMore: !!result.IsTruncated,
        status: STATUS_CODE.OK,
      },
      { status: STATUS_CODE.OK }
    );
  } catch (err: any) {
    console.error("Error listing B2 files:", err.message);

    return NextResponse.json(
      { error: err.message, status: STATUS_CODE.INTERNAL_SERVER_ERROR },
      { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
    );
  }
}
