"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserById } from "@/app/auth/actions";
import { useAppStore } from "./app-store.provider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { setLoading, setAuthenticated, setUser } = useAppStore((state) => state);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const { data: userData } = await supabase
        .from("users")
        .select()
        .eq("id", data.user?.id)
        .single();

      if (data?.user) {
        setAuthenticated(true);
        setUser(userData);
      } else {
        setAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthenticated(!!session);
      const userData = await getUserById(session?.user.id);
      setUser(userData);
    });

    return () => subscription.subscription.unsubscribe();
  }, [supabase, setAuthenticated, setUser, setLoading]);

  return <>{children}</>;
}
