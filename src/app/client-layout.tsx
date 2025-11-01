"use client";

import Navbar from "@/components/navbar";
import { UserInfo } from "@/interfaces/user";
import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Loader from "@/components/loader";
import { UserProvider } from "@/providers/user.providers";
import Footer from "@/components/footer";

export default function ClientLayout({
  user,
  children,
}: {
  user: UserInfo | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    setContentLoaded(false);
  }, [pathname]);

  return (
    <UserProvider initialUser={user}>
      <div className="mx-auto flex min-h-screen w-full flex-col items-stretch justify-start gap-8 px-2 py-4 sm:p-10 lg:max-w-[80em]">
        <Navbar />

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <main className="flex w-full flex-1 flex-col items-center justify-start">
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
