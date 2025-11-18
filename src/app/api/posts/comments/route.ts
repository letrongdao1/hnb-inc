import { getCurrentUserId } from "@/app/auth/actions";
import { NOTIFICATION_TYPE, STATUS_CODE } from "@/constants/enums";
import { PostComment } from "@/interfaces/news";
import { notifySpecificUser } from "@/lib/notifications/notifications";
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

    const reqData: Partial<PostComment> & { parent_user_id?: string } = await req.json();

    const params = {
      ...reqData,
      parent_user_id: undefined,
      user: userId,
    };

    const { data, error } = await supabase
      .from("post_comments")
      .insert(params)
      .select(
        "*, user:post_comments_user_fkey(id, display_name, avatar), post:post_comments_post_fkey(id, user, title, slug, active_at)"
      )
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

    if (reqData.parent_id && reqData.parent_user_id && reqData.parent_user_id !== userId)
      notifySpecificUser({
        supabase,
        user: reqData.parent_user_id,
        title: `${data.user.display_name} đã trả lời bình luận của bạn`,
        description: reqData.content,
        type: NOTIFICATION_TYPE.COMMENT,
        href: `/news/${data.post.slug}?cmt=${data.id}`,
        from_user: userId,
        ref_id: data.id,
      });

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
