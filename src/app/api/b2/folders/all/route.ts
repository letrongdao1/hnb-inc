import { NextResponse } from "next/server";
import { listAllFolderTree } from "@/lib/s3/folders";
import { STATUS_CODE } from "@/constants/enums";

export async function GET() {
  try {
    const data = await listAllFolderTree();

    return NextResponse.json({ data, status: STATUS_CODE.OK });
  } catch (err: any) {
    console.error("Failed to list folders:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
