import { LeaderboardModeType } from "@/components/home/StreakModal";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leaderboardMode = searchParams.get("mode") as LeaderboardModeType;

    if (!leaderboardMode) {
      return NextResponse.json({ error: "Không tìm thấy mode!" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_streaks")
      .select("*, user:user_streaks_user_id_fkey1(id, display_name, avatar)")
      .order(leaderboardMode === "peak" ? "longest_streak" : "current_streak", {
        ascending: false,
      });

    if (error) {
      console.error("Error fetching streaks:", error);
      return NextResponse.json({ error: "Lỗi lấy danh sách streak!" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
