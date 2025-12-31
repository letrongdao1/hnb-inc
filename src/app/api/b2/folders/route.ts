import { NextRequest, NextResponse } from "next/server";
import { FolderNode, listFolders } from "@/lib/s3/folders";
import { STATUS_CODE } from "@/constants/enums";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const folder = searchParams.get("folder") ?? "";

    const folders = await listFolders(folder);

    const data: FolderNode[] = folders.map((path) => {
      const parts = path.split("/").filter(Boolean);
      const subFolderName = parts[parts.length - 1];
      return { label: subFolderName, path };
    });

    return NextResponse.json({ data, status: STATUS_CODE.OK });
  } catch (err: any) {
    console.error("Failed to list folders:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
