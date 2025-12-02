// app/api/b2/folders/route.ts
import { NextResponse } from "next/server";
import { buildFolderTree, listAllFolders } from "@/lib/s3/folders";
import { STATUS_CODE } from "@/constants/enums";

export async function GET() {
  try {
    const bucket = process.env.B2_BUCKET_NAME!;
    const folders = await listAllFolders(bucket);
    const tree = buildFolderTree(folders);

    return NextResponse.json({ data: tree, status: STATUS_CODE.OK });
  } catch (err: any) {
    console.error("Failed to list folders:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
