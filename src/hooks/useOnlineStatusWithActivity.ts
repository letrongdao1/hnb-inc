import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState, useCallback } from "react";

export type ActivityStatus = "online" | "away";

const AWAY_TIMEOUT = 5 * 60 * 1000;

export function useOnlineStatusWithActivity(userId?: string) {
  const [presenceState, setPresenceState] = useState<Record<string, any[]>>({});
  const [myStatus, setMyStatus] = useState<ActivityStatus>("online");

  const awayTimer = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const supabase = createClient();

    const channel = supabase.channel("presence:global", {
      config: {
        presence: { key: userId },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setPresenceState(channel.presenceState());
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({ userId, status: "online" });
        }
      });

    channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
      if (leftPresences.some((p) => p.userId === userId)) {
        supabase.from("users").update({ last_active: new Date().toISOString() }).eq("id", userId);
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const trackStatus = useCallback(
    (status: ActivityStatus) => {
      setMyStatus(status);
      channelRef.current?.track({ userId, status });
    },
    [userId]
  );

  const resetAwayTimer = useCallback(() => {
    if (awayTimer.current) clearTimeout(awayTimer.current);

    trackStatus("online");

    awayTimer.current = setTimeout(() => {
      trackStatus("away");
    }, AWAY_TIMEOUT);
  }, [trackStatus]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((e) => window.addEventListener(e, resetAwayTimer));
    resetAwayTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetAwayTimer));
      if (awayTimer.current) clearTimeout(awayTimer.current);
    };
  }, [resetAwayTimer]);

  const onlineUserIds = Object.keys(presenceState);

  const getStatus = useCallback(
    (targetUserId: string): ActivityStatus | null => {
      const entries = presenceState[targetUserId];
      if (!entries || entries.length === 0) return null;

      if (entries.some((e) => e.status === "online")) return "online";
      return "away";
    },
    [presenceState]
  );

  return {
    onlineUserIds,
    getStatus,
    myStatus,
  };
}
