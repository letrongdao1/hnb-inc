"use client";

import React, { useState } from "react";
import Countdown from "react-countdown";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import { Skeleton, Tooltip } from "@heroui/react";
import { InfoIcon } from "../svg";
import DHBCLeaderboard from "./Leaderboard";
import { useRouter } from "next/navigation";

type DHBCWaitSectionProps = {
  nextQuizStartTime: string;
  latestAnswers?: string[];
};

export default function DHBCWaitSection({
  nextQuizStartTime,
  latestAnswers,
}: DHBCWaitSectionProps) {
  const router = useRouter();

  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-xs">
        <p className="text-default-500">Thời gian còn lại đến ĐHBC tiếp theo:</p>
        <span>
          <Tooltip
            content={
              <p>
                <span className="text-xs font-light">Thời gian mở ĐHBC mỗi ngày:</span>{" "}
                <span className="block font-semibold sm:inline">12:00 PM - 00:00 AM</span>
              </p>
            }
            isOpen={isTooltipOpen}
            onOpenChange={(open) => setIsTooltipOpen(open)}
            isDismissable={true}
          >
            <div className="cursor-pointer" onClick={() => setIsTooltipOpen((prev) => !prev)}>
              <InfoIcon size={16} />
            </div>
          </Tooltip>
        </span>
      </div>
      <div className="my-4 flex items-center justify-center self-stretch lg:scale-125">
        {nextQuizStartTime ? (
          <Countdown
            date={nextQuizStartTime}
            renderer={({ completed }) =>
              completed ? (
                <></>
              ) : (
                <FlipClockCountdown
                  to={nextQuizStartTime}
                  renderMap={[false, true, true, true]}
                  labels={["Ngày", "Giờ", "Phút", "Giây"]}
                  digitBlockStyle={{ fontSize: 24, width: 30, height: 40 }}
                  labelStyle={{ fontSize: 10 }}
                  dividerStyle={{ color: "transparent" }}
                  spacing={{
                    clock: 8,
                  }}
                  separatorStyle={{ size: 2 }}
                >
                  <></>
                </FlipClockCountdown>
              )
            }
            onComplete={() => {
              router.refresh();
            }}
          />
        ) : (
          <Skeleton className="h-16 w-80 rounded-md opacity-50" />
        )}
      </div>

      {latestAnswers && latestAnswers.length > 0 && (
        <div className="text-start px-4">
          <p className="text-default-500 text-sm">Kết quả trận trước:</p>
          <p className="text-2xl font-semibold uppercase">{latestAnswers.join(" ")}</p>
        </div>
      )}

      <DHBCLeaderboard />
    </div>
  );
}
