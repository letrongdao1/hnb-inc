import { DEFAULT_PAGE_SIZE } from "@/constants/constants";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || undefined;
    const pageIndex = parseInt(searchParams.get("pageIndex") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || DEFAULT_PAGE_SIZE.toString(), 10);

    const from = (pageIndex - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("upload_images")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (folder) {
      query = query.eq("folder", folder);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ status: STATUS_CODE.NOT_FOUND });
    }

    return NextResponse.json({
      data,
      status: STATUS_CODE.OK,
      pagination: {
        pageIndex,
        pageSize,
        total: count ?? undefined,
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
