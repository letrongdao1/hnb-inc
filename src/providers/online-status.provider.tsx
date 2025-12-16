"use client";

import { useOnlineStatusWithActivity } from "@/hooks/useOnlineStatusWithActivity";
import { createContext, useContext } from "react";

type OnlineStatusContextValue = ReturnType<typeof useOnlineStatusWithActivity>;

const OnlineStatusContext = createContext<OnlineStatusContextValue | null>(null);

export function OnlineStatusProvider({
  userId,
  children,
}: {
  userId: string | undefined;
  children: React.ReactNode;
}) {
  const value = useOnlineStatusWithActivity(userId);

  return <OnlineStatusContext.Provider value={value}>{children}</OnlineStatusContext.Provider>;
}

export function useOnlineStatusContext() {
  const ctx = useContext(OnlineStatusContext);
  if (!ctx) {
    throw new Error("useOnlineStatusContext must be used inside OnlineStatusProvider");
  }
  return ctx;
}
