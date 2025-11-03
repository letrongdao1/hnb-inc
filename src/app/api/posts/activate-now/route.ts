import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    const { error } = await supabase
      .from("posts")
      .update({ active_at: new Date().toISOString() })
      .eq("id", postId);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Cập nhật thời gian đăng bản tin thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Cập nhật thời gian đăng bản tin thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
