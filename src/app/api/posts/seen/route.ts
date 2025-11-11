import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
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

    const reqData: { postId: string } = await req.json();

    const data = {
      post: reqData.postId,
      user: userId,
    };

    const { error } = await supabase.from("post_seen").upsert(data);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Đánh dấu xem bản tin lỗi. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Đánh dấu xem bản tin thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
