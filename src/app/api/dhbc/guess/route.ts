import { getCurrentUserId } from "@/app/auth/actions";
import { STATUS_CODE } from "@/constants/enums";
import { createClient } from "@/lib/supabase/server";
import { DHBCUtils } from "@/utils/dhbc.utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getCurrentUserId();

    const { quiz, words } = await req.json();

    if (!quiz)
      return NextResponse.json({
        status: STATUS_CODE.BAD_REQUEST,
        message: "Không tìm thấy thông tin câu hỏi. Vui lòng thử lại sau!",
      });

    const { data: answerWords, error } = await supabase
      .from("dhbc_quiz_words")
      .select("*, quiz!inner(id)")
      .eq("quiz.id", quiz)
      .order("index", { ascending: true });

    if (error || !answerWords) {
      console.log({ error });
      return NextResponse.json({
        status: STATUS_CODE.ERROR,
        message: "Không tìm thấy thông tin đáp án. Vui lòng thử lại sau!",
      });
    }

    if (!words || words.length !== answerWords.length) {
      return NextResponse.json({
        status: STATUS_CODE.BAD_REQUEST,
        message: "Đáp án không đủ. Vui lòng thử lại!",
      });
    }

    let rightWordCount = 0;
    words.forEach((word: any, index: number) => {
      const answer = answerWords.find((ans) => ans.index === index);
      if (!answer) return;

      const check = DHBCUtils.compareWords(
        word,
        [answer.word, answer.variants].filter(Boolean).join(",")
      );

      if (check) rightWordCount += 1;
    });

    await supabase.rpc("upsert_quiz_submission", {
      _user: userId,
      _quiz: quiz,
    });

    const isFinished = rightWordCount === answerWords.length;

    if (isFinished) {
      await supabase
        .from("dhbc_quiz_submissions")
        .update({ status: 1 })
        .eq("quiz", quiz)
        .eq("user", userId);
    }

    return NextResponse.json({
      data: { rightWordCount, answerWords: isFinished ? answerWords : [] },
      status: STATUS_CODE.OK,
      message: "Kiểm tra kết quả thành công.",
    });
  } catch (err) {
    console.log({ err });
    return NextResponse.json({
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: "Lỗi không xác định. Vui lòng thử lại sau!",
    });
  }
}
