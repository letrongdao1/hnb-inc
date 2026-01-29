import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { TopBanner } from "@/interfaces/common";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("top_banners")
      .select("*")
      .eq("status", true)
      .lte("active_at", now)
      .or(`expired_at.gte.${now},expired_at.is.null`)
      .order("active_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ data: null, status: STATUS_CODE.NOT_FOUND });
    }

    return NextResponse.json({ data, status: STATUS_CODE.OK });
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

    const params: Partial<TopBanner> = await req.json();

    const { error } = await supabase.from("top_banners").insert(params);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Tạo banner thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.CREATED,
      message: "Tạo banner thành công.",
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

    const data: Partial<TopBanner> = await request.json();

    const { error } = await supabase.from("top_banners").update(data).eq("id", data.id);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Cập nhật banner thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Cập nhật banner thành công.",
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
    const bannerId = searchParams.get("bannerId");

    const { error } = await supabase.from("top_banners").delete().eq("id", bannerId);

    if (error) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Xóa banner thất bại. Vui lòng thử lại sau!",
      });
    }

    return NextResponse.json({
      status: STATUS_CODE.OK,
      message: "Xóa banner thành công.",
    });
  } catch {
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
