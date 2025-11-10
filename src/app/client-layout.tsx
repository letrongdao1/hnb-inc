"use client";

import Navbar from "@/components/Navbar";
import { UserInfo } from "@/interfaces/user";
import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { UserProvider } from "@/providers/user.provider";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { AUTH_NOT_REQUIRED_PATHS } from "@/constants/constants";
import { NotificationProvider } from "@/providers/notification.provider";

export default function ClientLayout({
  user,
  children,
}: {
  user: UserInfo | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isUnAuthenticated = !AUTH_NOT_REQUIRED_PATHS.some((path) => pathname === path);

      if (!user && isUnAuthenticated) {
        sessionStorage.setItem("redirectAfterLogin", pathname);
        router.replace("/auth/login");
      }
    }

    checkAuth();
  }, [pathname, router, supabase]);

  useEffect(() => {
    setContentLoaded(false);
  }, [pathname]);

  return (
    <UserProvider initialUser={user}>
      <NotificationProvider userId={user?.id}>
        <div className="mx-auto flex min-h-screen w-full flex-col items-stretch justify-start gap-8 px-2 py-4 sm:p-10 lg:max-w-[80em]">
          <Navbar />

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-1 items-stretch"
            >
              <main className="flex w-full flex-col items-center justify-start">
                <Suspense fallback={<Loader />}>
                  <ContentWithReadySignal onReady={() => setContentLoaded(true)}>
                    {children}
                  </ContentWithReadySignal>
                </Suspense>
              </main>
            </motion.div>
          </AnimatePresence>

          {contentLoaded && <Footer />}
        </div>
      </NotificationProvider>
    </UserProvider>
  );
}

function ContentWithReadySignal({
  children,
  onReady,
}: {
  children: React.ReactNode;
  onReady: () => void;
}) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return <>{children}</>;
}
