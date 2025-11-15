"use client";

import { UserStreak } from "@/interfaces/common";
import {
  Avatar,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalProps,
  Skeleton,
  Tab,
  Tabs,
} from "@heroui/react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { FireAnimatedIcon, FireIcon } from "../svg/complex";
import { Nabla } from "next/font/google";
import { STATUS_CODE } from "@/constants/enums";
import { MedalIcon } from "../svg";
import { useUser } from "@/providers/user.provider";
import { UserInfo } from "@/interfaces/user";

const nabla = Nabla({ subsets: ["latin"], weight: "400" });

type StreakModalProps = Partial<ModalProps> & {
  userStreak: UserStreak | null;
};

export type LeaderboardModeType = "current" | "peak";

export default function StreakModal({
  isOpen,
  onOpenChange,
  onClose,
  userStreak,
}: StreakModalProps) {
  const { user } = useUser();
  const count = useMotionValue(1);
  const rounded = useTransform(() => Math.round(count.get()));

  const [streakList, setStreakList] = useState<UserStreak[]>([]);
  const [leaderboardMode, setLeaderboardMode] = useState<LeaderboardModeType>("current");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const tabs = [
    {
      id: "current",
      label: "Hiện tại",
    },
    {
      id: "peak",
      label: "Kỷ lục",
    },
  ];

  const isStreakPeak = useMemo(
    () => Boolean(userStreak && userStreak.current_streak === userStreak.longest_streak),
    [userStreak]
  );

  useEffect(() => {
    if (!userStreak) return;
    const duration = userStreak.current_streak < 10 ? 1 : 3;
    const controls =
      isOpen && animate(count, userStreak.current_streak, { duration, ease: "easeOut" });
    return () => {
      if (controls) controls.stop();
    };
  }, [isOpen, userStreak, count]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStreakLeaderboard = async () => {
      setIsLoading(true);
      await fetch(`/api/streaks/leaderboard?mode=${leaderboardMode}`)
        .then((res) => res.json())
        .then((result) => {
          console.log({ result });
          if (result.status === STATUS_CODE.OK) {
            setStreakList(result.data);
          }
        })
        .finally(() => setIsLoading(false));
    };

    fetchStreakLeaderboard();
  }, [isOpen, leaderboardMode]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={() => {
        onClose?.();
      }}
      placement="center"
      size="3xl"
    >
      <ModalContent>
        <ModalBody className="max-h-[80vh] overflow-auto">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:gap-16">
            <div className="flex flex-1 flex-col items-stretch justify-center gap-2">
              <div className="flex items-center justify-center gap-4 py-8">
                <FireAnimatedIcon size={50} />
                <motion.pre className={`text-[5em] ${nabla.className}`}>{rounded}</motion.pre>
              </div>

              {isStreakPeak ? (
                <p className="text-center text-sm font-light text-amber-500 italic">
                  Bạn đang trong streak kỷ lục 💪
                </p>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <p className="text-center text-sm font-light">Streak dài nhất:</p>{" "}
                  <FireIcon size={16} />
                  <p className="text-base font-bold text-amber-500">{userStreak?.longest_streak}</p>
                </div>
              )}

              <p className="text-xs opacity-75 text-center mt-4">Đăng nhập vào HNB Hub hàng ngày để giữ streak!</p>
            </div>

            <div className="flex flex-1 flex-col items-stretch gap-2 py-4">
              <p className="mb-2 text-sm font-medium opacity-75">Bảng xếp hạng HNB Streak</p>

              <Tabs
                variant="underlined"
                selectedKey={leaderboardMode}
                onSelectionChange={(key) => setLeaderboardMode(key as LeaderboardModeType)}
              >
                <Tab key="current" title={<p className="text-xs">Hiện tại</p>} />
                <Tab key="peak" title={<p className="text-xs">Kỷ lục</p>} />
              </Tabs>

              <Card>
                <CardBody>
                  {isLoading ? (
                    <div className="flex flex-col items-stretch gap-2">
                      {Array.from({ length: streakList.length || 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="aspect-square w-10 rounded-full" />
                          <Skeleton className="h-10 flex-3 rounded-md" />
                          <Skeleton className="h-10 flex-1 rounded-md" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <LeaderboardTable
                      list={streakList}
                      leaderboardMode={leaderboardMode}
                      user={user}
                    />
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const LeaderboardTable = ({
  list,
  leaderboardMode,
  user,
}: {
  list: UserStreak[];
  leaderboardMode: "current" | "peak";
  user: UserInfo | null;
}) => {
  const getTopBadgeClassName = (index: number) => {
    const base = "font-black text-base ";
    switch (index) {
      case 1:
        return base + "text-[#FFB319]";
      case 2:
        return base + "text-[#949FA6]";
      case 3:
        return base + "text-[#A37E49]";
      default:
        return "text-xs";
    }
  };
  if (!list.length)
    return <p className="py-8 text-center text-sm font-light opacity-75">Chưa có streak</p>;

  return (
    <div className="relative flex max-h-96 flex-col items-stretch justify-start gap-2">
      {list.map((streak: UserStreak, index) => (
        <span
          key={index}
          className={`flex items-center gap-4 rounded-md px-2 py-1 ${streak.user.id === user?.id && "sticky -bottom-3 bg-sky-200 dark:bg-sky-900"}`}
        >
          <p className={`text-tiny shrink-0 opacity-75 ${getTopBadgeClassName(index + 1)}`}>
            {index + 1}
          </p>
          <Avatar src={streak.user.avatar} alt="" size="sm" className="shrink-0" />
          <span
            className={`flex flex-3 items-center justify-start gap-2 ${getTopBadgeClassName(index + 1)}`}
          >
            <p className="line-clamp-1">{streak.user.display_name}</p>
            {index < 3 && <MedalIcon size={16} />}
          </span>
          <span className="flex flex-1 items-center justify-end gap-1">
            {leaderboardMode === "current" ? streak.current_streak : streak.longest_streak}{" "}
            <FireIcon size={12} />
          </span>
        </span>
      ))}
    </div>
  );
};
