import { STATUS_CODE } from "@/constants/enums";
import { UserInfo } from "@/interfaces/user";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

export type ActivityStatus = "online" | "away";

type PresenceStateProps = {
  userId: string;
  status: ActivityStatus;
};

const AWAY_TIMEOUT = 5 * 60 * 1000;
const LAST_ACTIVE_UPDATE_INTERVAL = Boolean(process.env.NEXT_PUBLIC_IS_TESTING)
  ? 1000 * 60 * 60
  : 1000 * 60 * 1;

export function useOnlineStatusWithActivity(userId?: string) {
  const [availableUserList, setAvailableUserList] = useState<UserInfo[]>([]);
  const [presenceState, setPresenceState] = useState<Record<string, PresenceStateProps[]>>({});
  const [myStatus, setMyStatus] = useState<ActivityStatus>("online");

  const onlineUserIds = useMemo(() => Object.keys(presenceState), [presenceState]);

  const awayTimer = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const lastActiveRef = useRef(0);

  const fetchAvailableUserList = useCallback(async () => {
    await fetch("/api/users/available")
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          setAvailableUserList(result.data);
        }
      });
  }, []);

  useEffect(() => {
    fetchAvailableUserList();
  }, [fetchAvailableUserList]);

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
        setPresenceState({ ...channel.presenceState() });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({ userId, status: "online" });
        }
      });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      setPresenceState({ ...channel.presenceState() });

      setAvailableUserList((prev) =>
        prev.map((user) =>
          user.id !== key
            ? user
            : {
                ...user,
                last_active: new Date().toISOString(),
              }
        )
      );
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    const updateLastActive = () => {
      const now = Date.now();
      if (now - lastActiveRef.current < LAST_ACTIVE_UPDATE_INTERVAL) {
        return;
      }

      lastActiveRef.current = now;
      navigator.sendBeacon("/api/users/last-active");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) updateLastActive();
    };

    window.addEventListener("pagehide", updateLastActive);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", updateLastActive);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
    availableUserList,
    onlineUserIds,
    getStatus,
    myStatus,
  };
}
