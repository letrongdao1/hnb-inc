import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentUserId, getCurrentUserInfo } from "../auth/actions";
import DHBCWaitSection from "@/components/dhbc/WaitSection";
import { DHBCUtils } from "@/utils/dhbc.utils";
import { DHBCQuizSubmissionStatus } from "@/interfaces/dhbc";
import DHBCMainSection from "@/components/dhbc/MainSection";
import { RoleUtils } from "@/utils/role.utils";
import { ROLE } from "@/constants/enums";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("ĐHBC"),
    description: "Môn thể thao thi đấu ĐHBC của HNB",
  };
}

export default async function DHBCPage() {
  const supabase = await createClient();
  const user = await getCurrentUserInfo();

  const { nextQuizStartTime, isAvailable } = getDHBCTime();
  const userTodayQuiz = await getUserTodayQuizSubmission(supabase);

  if (!isAvailable || (user && RoleUtils.checkIsRole(user, ROLE.IT))) {
    const latestAnswers = await getLatestAnswers(supabase);
    return (
      <DHBCWaitSection nextQuizStartTime={nextQuizStartTime} latestAnswers={latestAnswers || []} />
    );
  }

  const todayQuiz = await getTodayQuizQuestion(
    supabase,
    userTodayQuiz && userTodayQuiz.status === DHBCQuizSubmissionStatus.DONE
  );

  return (
    <DHBCMainSection
      quiz={todayQuiz}
      currentSubmission={userTodayQuiz}
      nextQuizStartTime={nextQuizStartTime}
    />
  );
}

export async function getUserTodayQuizSubmission(supabase: SupabaseClient) {
  const userId = await getCurrentUserId();
  const todayDate = CommonUtils.getTodayAsDate();

  const { data, error } = await supabase
    .from("dhbc_quiz_submissions")
    .select("*, quiz!inner(date)")
    .eq("quiz.date", todayDate)
    .eq("user", userId)
    .maybeSingle();

  if (!data || error) {
    console.log({ error });
    return null;
  }

  return data;
}

export async function getTodayQuizQuestion(supabase: SupabaseClient, getAnswers: boolean = false) {
  const todayDate = CommonUtils.getTodayAsDate();

  const { data: quizData, error: quizError } = await supabase
    .from("dhbc_quizzes")
    .select("*")
    .eq("date", todayDate)
    .maybeSingle();

  if (!quizData || quizError) return null;

  if (!quizData.id) return;

  const { data: wordData, error: wordError } = await supabase
    .from("dhbc_quiz_words")
    .select(getAnswers ? "*" : "id, index, image_url, created_at")
    .eq("quiz", quizData.id)
    .order("index", { ascending: true });

  if (!wordData || wordError) return null;

  return {
    ...quizData,
    words: wordData,
  };
}

export function getDHBCTime() {
  const nextQuizStartTime = DHBCUtils.getNextStartTime().toISOString();
  const isAvailable = DHBCUtils.checkIsAtQuizAvailableTime();

  return { nextQuizStartTime, isAvailable };
}

export async function getLatestAnswers(supabase: SupabaseClient) {
  const yesterday = CommonUtils.getYesterday();

  const { data: quizData, error: quizError } = await supabase
    .from("dhbc_quizzes")
    .select("*")
    .eq("date", yesterday)
    .limit(1)
    .maybeSingle();

  if (!quizData || quizError) return null;

  if (!quizData.id) return;

  const { data: wordData, error: wordError } = await supabase
    .from("dhbc_quiz_words")
    .select("id, index, word")
    .eq("quiz", quizData.id)
    .order("index", { ascending: true });

  if (!wordData || wordError) return null;

  return wordData.map((word) => word.word);
}
