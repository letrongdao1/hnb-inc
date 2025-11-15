import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function StreakUpdater() {
  const supabase = createClient();

  const STREAK_KEY = "streak-updated-date";

  function hasUpdatedToday() {
    const today = new Date().toISOString().split("T")[0];
    return localStorage.getItem(STREAK_KEY) === today;
  }

  function markUpdatedToday() {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(STREAK_KEY, today);
  }

  useEffect(() => {
    const updateStreak = async () => {
      if (!supabase.auth.getSession) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (!hasUpdatedToday()) {
        await supabase.rpc("update_user_streak", { p_user_id: user.id });
        markUpdatedToday();
      }
    };

    updateStreak();
  }, [supabase]);

  return null;
}
