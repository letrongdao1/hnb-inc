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

    const reqData: {
      commentId: string;
      reaction_type: "like" | "dislike";
      increment: number;
    } = await req.json();

    const { error } = await supabase.rpc("increment_post_comment_reaction", {
      p_comment_id: reqData.commentId,
      p_reaction_type: reqData.reaction_type,
      p_increment: reqData.increment,
    });

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Cập nhật biểu cảm thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Cập nhật biểu cảm thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
