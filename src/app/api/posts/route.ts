import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { STATUS_CODE } from "@/constants/enums";
import { getCurrentUserId } from "@/app/auth/actions";
import { PostInfo } from "@/interfaces/news";
import { DEFAULT_PAGE_SIZE } from "@/constants/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageIndex = parseInt(searchParams.get("pageIndex") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10);

    const supabase = await createClient();

    const from = (pageIndex - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: postData,
      count,
      error,
    } = await supabase
      .from("posts")
      .select("*, user:posts_user_fkey(id, display_name, avatar)", { count: "exact" })
      .range(from, to)
      .order("active_at", { ascending: false });

    if (error || !postData) {
      console.error("Error fetching posts:", error);
      return NextResponse.json({ error: "Lỗi lấy danh sách bản tin!" }, { status: 500 });
    }

    const posts = await Promise.all(
      postData.map(async (post: any) => ({
        ...post,
        user: post.user ? CommonUtils.getSingleDataFromUnknown(post.user) : null,
        seenBy: (await supabase
          .from("post_seen")
          .select("*, user:post_seen_user_fkey(id, display_name, avatar)")
          .eq("post", post.id)).data || [],
      }))
    );

    return NextResponse.json({ data: posts, count: count, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
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

    const reqData: Partial<PostInfo> = await req.json();

    const data = {
      ...reqData,
      user: userId,
    };

    const { error } = await supabase.from("posts").insert(data);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Tạo bản tin thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.CREATED,
      message: "Tạo bản tin thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const data: Partial<PostInfo> = await request.json();

    const { error } = await supabase.from("posts").update(data).eq("id", data.id);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Cập nhật bản tin thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Cập nhật bản tin thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Xóa bản tin thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Xóa bản tin thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
