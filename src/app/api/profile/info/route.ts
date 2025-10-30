import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, getCurrentUserInfo } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { UserInfo } from "@/interfaces/user";

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const data: Partial<UserInfo> = await req.json();

    const { error } = await supabase.from("users").update(data).eq("id", userId);

    if (error) {
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Cập nhật thông tin tài khoản thất bại. Vui lòng thử lại sau!",
      });
    }

    const user = await getCurrentUserInfo();

    if (!user) {
      return NextResponse.json({
        status: STATUS_CODE.NOT_FOUND,
        message: "Lỗi lấy thông tin tài khoản!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      data: user,
      message: "Cập nhật thông tin tài khoản thành công",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
