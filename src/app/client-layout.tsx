"use client";

import Navbar from "@/components/navbar";
import { UserInfo } from "@/interfaces/user";
import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Loader from "@/components/loader";
import { UserProvider } from "@/providers/user.provider";
import Footer from "@/components/footer";
import { NotificationProvider } from "@/providers/notification.provider";
import StreakUpdater from "@/hooks/useStreakUpdater";
import { TopBanner as ITopBanner } from "@/interfaces/common";
import { LOCAL_STORAGE_KEY, STATUS_CODE } from "@/constants/enums";
import TopBanner from "@/components/top-banner";

export default function ClientLayout({
  user,
  children,
}: {
  user: UserInfo | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [contentLoaded, setContentLoaded] = useState<boolean>(false);
  const [topBanner, setTopBanner] = useState<ITopBanner>();
  const [isShowTopBanner, setIsShowTopBanner] = useState<boolean>(false);

  useEffect(() => {
    setContentLoaded(false);
  }, [pathname]);

  useEffect(() => {
    const fetchTopBanner = async () => {
      await fetch("/api/top-banners")
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            const checkHidden = localStorage.getItem(LOCAL_STORAGE_KEY.HIDDEN_TOP_BANNER);
            if (!checkHidden || checkHidden !== String(result.data.id)) {
              setTopBanner(result.data);
              setIsShowTopBanner(true);
            }
          }
        });
    };

    fetchTopBanner();
  }, []);

  return (
    <UserProvider initialUser={user}>
      <NotificationProvider userId={user?.id}>
        <div
          className={`relative mx-auto flex min-h-screen w-full flex-col items-stretch justify-start gap-8 px-2 py-2 md:py-8 lg:max-w-[80em]`}
        >
          <div className="flex w-full flex-col items-stretch gap-2">
            {isShowTopBanner && (
              <AnimatePresence>
                <TopBanner
                  topBanner={topBanner}
                  isShowTopBanner={isShowTopBanner}
                  setIsShowTopBanner={setIsShowTopBanner}
                />
              </AnimatePresence>
            )}
            <Navbar />
          </div>

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

          <StreakUpdater />
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
