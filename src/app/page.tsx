import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "./auth/actions";
import HomePage from "@/components/home";

export default async function Home() {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const userStreak = await getCurrentUserStreak();

  return <HomePage userStreak={userStreak} />;
}

export async function getCurrentUserStreak() {
  const supabase = await createClient();
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
