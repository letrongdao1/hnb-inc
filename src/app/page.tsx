import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "./auth/actions";
import HomePage from "@/components/home";
import { SupabaseClient } from "@supabase/supabase-js";
import { CommonUtils } from "@/utils/common.utils";

export default async function Home() {
  const supabase = await createClient();

  const userStreak = await getCurrentUserStreak(supabase);

  const nextBirthdayUsers = await getNextBirthday(supabase);

  const randomImage = await getRandomImage(supabase);

  return (
    <HomePage
      userStreak={userStreak}
      nextBirthdayUsers={nextBirthdayUsers}
      randomImage={randomImage}
    />
  );
}

export async function getCurrentUserStreak(supabase: SupabaseClient) {
  const userId = await getCurrentUserId();

  if (!userId) return null;

  await supabase.rpc("update_user_streak", { p_user_id: userId });

  const { data } = await supabase
    .from("user_streaks")
    .select("*, user:user_streaks_user_id_fkey1(id, display_name, avatar)")
    .eq("user_id", userId)
    .limit(1)
    .single();

  return data || null;
}

export async function getNextBirthday(supabase: SupabaseClient) {
  const { data } = await supabase.rpc("get_current_month_birthday_users");

  return data || [];
}

export async function getRandomImage(supabase: SupabaseClient) {
  const { data } = await supabase.rpc("get_daily_image");

  return data ? CommonUtils.getSingleDataFromUnknown(data) : null;
}
