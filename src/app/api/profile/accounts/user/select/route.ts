import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";
import { CommonUtils } from "@/utils/common.utils";

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          status: STATUS_CODE.ERROR,
          message: "Không tìm thấy tài khoản!",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: checkSelected } = await supabase
      .from("bank_accounts")
      .select()
      .eq("is_selected", true)
      .limit(1)
      .maybeSingle();

    const parsedCurrentlySelected = CommonUtils.getSingleDataFromUnknown(checkSelected);

    if (parsedCurrentlySelected) {
      await supabase
        .from("bank_accounts")
        .update({ is_selected: false })
        .eq("id", parsedCurrentlySelected.id)
        .select();
    }

    const { error } = await supabase
      .from("bank_accounts")
      .update({ is_selected: true })
      .eq("id", id)
      .select();

    return NextResponse.json(
      {
        status: error ? STATUS_CODE.ERROR : STATUS_CODE.OK,
        message: error
          ? "Chọn tài khoản sử dụng không thành công. Vui lòng thử lại sau!"
          : "Đã thay đổi tài khoản sử dụng.",
      },
      { status: error ? 500 : 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: STATUS_CODE.ERROR,
        message: "Lỗi không xác định. Vui lòng thử lại sau!",
      },
      { status: 500 }
    );
  }
}
