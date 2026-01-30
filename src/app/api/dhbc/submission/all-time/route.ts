import { STATUS_CODE } from "@/constants/enums";
import { DHBCQuizSubmissionStatus } from "@/interfaces/dhbc";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("dhbc_quiz_submissions")
      .select("*, quiz(date), user(id, display_name, avatar)")
      .order("total_trial", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return NextResponse.json({ data: [], status: STATUS_CODE.NOT_FOUND });

    const groupedList = Object.values(
      data.reduce((acc, submission) => {
        const userId = submission.user.id;
        if (!acc[userId]) {
          acc[userId] = {
            ...submission,
            allTimeStats: {
              totalSubmission: 0,
              totalSuccess: 0,
              totalTrial: 0,
            },
          };
        }

        acc[userId].allTimeStats.totalSubmission += 1;
        if (submission.status === DHBCQuizSubmissionStatus.DONE) {
          acc[userId].allTimeStats.totalSuccess += 1;
        }
        acc[userId].allTimeStats.totalTrial += submission.total_trial;

        return acc;
      }, {})
    );

    const sortedList = groupedList
      .map((p: any) => ({
        ...p,
        allTimeStats: {
          totalSuccess: p.allTimeStats.totalSuccess,
          avgTrials:
            p.allTimeStats.totalSuccess > 0
              ? p.allTimeStats.totalTrial / p.allTimeStats.totalSuccess
              : Infinity,
        },
      }))
      .sort(
        (a, b) =>
          b.allTimeStats.totalSuccess - a.allTimeStats.totalSuccess ||
          a.allTimeStats.avgTrials - b.allTimeStats.avgTrials ||
          b.allTimeStats.totalSubmission - a.allTimeStats.totalSubmission
      );

    return NextResponse.json({ data: sortedList, status: STATUS_CODE.OK });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Lỗi không xác định!" }, { status: 500 });
  }
}
