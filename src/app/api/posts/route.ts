import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { STATUS_CODE } from "@/constants/enums";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageIndex = parseInt(searchParams.get("pageIndex") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const supabase = await createClient();

    const from = (pageIndex - 1) * pageSize;
    const to = from + pageSize - 1;
    const NOW = new Date(Date.now()).toISOString();

    const { data: postData, count, error } = await supabase
      .from("posts")
      .select("*, user: users(id, display_name, avatar)", { count: "exact" })
      .range(from, to)
      .order("active_at", { ascending: false });

    if (error || !postData) {
      console.error("Error fetching posts:", error);
      return NextResponse.json({ error: "Lỗi lấy danh sách bản tin!" }, { status: 500 });
    }

    const posts = postData.map((post: any) => ({
      ...post,
      user: post.user ? CommonUtils.getSingleDataFromUnknown(post.user) : null,
    }));

    return NextResponse.json({ data: posts, count: count, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
