import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "./auth/actions";
import HomePage from "@/components/home";
import { SupabaseClient } from "@supabase/supabase-js";
import { CommonUtils } from "@/utils/common.utils";

export default async function Home() {
  const supabase = await createClient();

  const userStreak = await getCurrentUserStreak(supabase);

  const nextBirthdayUser = await getNextBirthday(supabase);

  const randomImage = await getRandomImage(supabase);

  return (
    <HomePage
      userStreak={userStreak}
      nextBirthdayUser={nextBirthdayUser}
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
  const { data } = await supabase.rpc("get_next_birthday_user");

  return data ? data?.[0] || data : null;
}

export async function getRandomImage(supabase: SupabaseClient) {
  const { data } = await supabase.rpc("get_daily_image");

  return data ? CommonUtils.getSingleDataFromUnknown(data) : null;
}
