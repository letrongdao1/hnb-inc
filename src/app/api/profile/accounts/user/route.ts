import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { BankAccount } from "@/interfaces/common";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId)
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        error: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });

    const { data, error } = await supabase
      .from("bank_accounts")
      .select(
        "id, account_number, account_owner, bank_code, bank_name, bank_short_name, bank_logo, is_selected, created_at"
      )
      .eq("user", userId)
      .order("is_selected", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) {
      return NextResponse.json({ data, status: STATUS_CODE.OK });
    } else {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        error: "Lỗi lấy danh sách tài khoản của người dùng.",
      });
    }
  } catch (err) {
    console.error("GET /api/bank-accounts error:", err);
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Không tìm thấy ID người dùng. Vui lòng thử lại sau!",
      });
    }

    const body: Partial<BankAccount> = await req.json();

    const { data: checkExistAccount } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("bank_code", body.bank_code)
      .eq("account_number", body.account_number)
      .eq("account_owner", body.account_owner)
      .maybeSingle();

    if (checkExistAccount) {
      return NextResponse.json({
        status: STATUS_CODE.CONFLICT,
        message: "Tài khoản đã tồn tại trên hệ thống. Vui lòng sử dụng tài khoản khác!",
      });
    }

    const { data: userAccounts } = await supabase
      .from("bank_accounts")
      .select()
      .eq("user", userId)
      .limit(1);

    const { error } = await supabase.from("bank_accounts").insert({
      ...body,
      user: userId,
      is_selected: !userAccounts || userAccounts.length === 0,
    });

    if (error) {
      return NextResponse.json({
        status: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Thêm tài khoản lỗi. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.CREATED,
      message: "Thêm tài khoản thành công.",
    });
  } catch (err) {
    console.error("POST /api/bank-accounts error:", err);
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({
        status: STATUS_CODE.NOT_FOUND,
        message: "Không tìm thấy tài khoản!",
      });
    }

    const supabase = await createClient();

    const { error } = await supabase.from("bank_accounts").delete().eq("id", id);

    return NextResponse.json({
      status: error ? STATUS_CODE.ERROR : STATUS_CODE.OK,
      message: error
        ? "Xóa tài khoản không thành công. Vui lòng thử lại sau!"
        : "Đã xóa tài khoản.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
