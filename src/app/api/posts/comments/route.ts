import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { PostComment } from "@/interfaces/news";
import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { NextRequest, NextResponse } from "next/server";

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

    const reqData: Partial<PostComment> = await req.json();

    const params = {
      ...reqData,
      user: userId,
    };

    const { data, error } = await supabase
      .from("post_comments")
      .insert(params)
      .select("*, user:post_comments_user_fkey(id, display_name, avatar)")
      .maybeSingle();

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Bình luận bản tin thất bại. Vui lòng thử lại sau!",
      });
    }

    const formatComment: PostComment = {
      ...CommonUtils.getSingleDataFromUnknown(data),
      children: [],
    };

    return NextResponse.json({
      status: STATUS_CODE.CREATED,
      data: formatComment,
      message: "Bình luận bản tin thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
