import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage.from("avatar").list("avatar", { limit: 50 });

    const urlList: string[] = [];

    if (data && data.length) {
      data.map((d) => {
        const urlData = supabase.storage.from("avatar").getPublicUrl(`avatar/${d.name}`);
        if (urlData) urlList.push(urlData.data.publicUrl);
      });
    }

    if (data) {
      return NextResponse.json({ data: urlList, status: STATUS_CODE.OK });
    } else {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        error: "Lỗi lấy danh sách avatar default.",
      });
    }
  } catch (err) {
    console.error("GET /api/profile/default-avatars error:", err);
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
