import { getCurrentUserId, getCurrentUserInfo } from "@/app/auth/actions";
import { NOTIFICATION_TYPE, STATUS_CODE } from "@/constants/enums";
import { hasSentNotificationRecently, notifySpecificUser } from "@/lib/notifications/notifications";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const currentUser = await getCurrentUserInfo();

    if (!currentUser) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const reqData: {
      commentId: string;
      commentUserId: string;
      commentContent: string;
      postSlug: string;
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

    notifySpecificUser({
      supabase,
      user: reqData.commentUserId,
      title: `${currentUser.display_name} đã bày tỏ cảm xúc với bình luận của bạn`,
      description: reqData.commentContent,
      type:
        reqData.reaction_type === "like"
          ? NOTIFICATION_TYPE.REACTION_LIKE
          : NOTIFICATION_TYPE.REACTION_DISLIKE,
      href: `/news/${reqData.postSlug}?cmt=${reqData.commentId}`,
      from_user: currentUser.id,
      ref_id: reqData.commentId,
    });

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
