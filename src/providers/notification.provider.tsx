"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Notification } from "@/interfaces/common";
import { createClient } from "@/lib/supabase/client";
import { addToast } from "@heroui/react";
import { getNotiDisplayStyle } from "@/components/navbar/notificationList";

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAsReadAll: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const supabase = createClient();

export function NotificationProvider({
  userId,
  children,
}: {
  userId: string | undefined;
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchNotificationList = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user", userId)
        .order("created_at", { ascending: false });

      if (!error && data) setNotifications(data);
    };

    fetchNotificationList();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          addToast({
            title: (
              <div className="w-full font-semibold wrap-anywhere text-ellipsis">
                {newNotification.title}:&ensp;
                <span className="text-sm font-light wrap-anywhere">
                  {newNotification.description}
                </span>
              </div>
            ),
            color: "default",
            variant: "flat",
            icon: (
              <div className="min-w-12">
                {getNotiDisplayStyle(newNotification.type)?.icon || <></>}
              </div>
            ),
          });
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    if (!error) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    }
  };

  const markAsReadAll = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user", userId)
      .eq("is_read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const clearAll = async () => {
    const { error } = await supabase.from("notifications").delete().eq("user", userId);

    if (!error) setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAsReadAll, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
}
