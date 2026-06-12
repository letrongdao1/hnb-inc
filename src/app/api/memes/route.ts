import { getCurrentUserId } from "@/app/auth/actions";
import { DEFAULT_PAGE_SIZE } from "@/constants/constants";
import { STATUS_CODE } from "@/constants/enums";
import { Meme } from "@/interfaces/common";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchKeyword = searchParams.get("search")?.trim();
    const pageIndex = parseInt(searchParams.get("pageIndex") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10);

    const supabase = await createClient();

    const from = (pageIndex - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("memes")
      .select("*, user:memes_user_fkey(id, display_name, avatar)", { count: "exact" })
      .eq("is_active", true);

    if (searchKeyword) {
      const formattedSearch = searchKeyword
        .split(/\s+/)
        .map((word) => `${word}:*`)
        .join(" & ");

      query = query.filter("search_vector", "fts", formattedSearch);
    }

    const { data, count, error } = await query.range(from, to);

    if (error || !data) {
      console.error("Error fetching memes:", error);
      return NextResponse.json(
        { error: "Lỗi lấy danh sách meme!" },
        { status: STATUS_CODE.NOT_FOUND }
      );
    }

    return NextResponse.json({ data, count: count, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Lỗi không xác định!" },
      { status: STATUS_CODE.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const reqData: Partial<Meme> = await req.json();

    const params = {
      ...reqData,
      user: userId,
    };

    const { data, error } = await supabase.from("memes").insert(params).select("id").maybeSingle();

    if (error || !data) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Tạo meme thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.CREATED,
      message: "Tạo meme thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}