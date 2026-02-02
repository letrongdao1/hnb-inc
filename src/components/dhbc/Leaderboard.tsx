"use client";

import { STATUS_CODE } from "@/constants/enums";
import { DHBCQuizSubmission, DHBCQuizSubmissionStatus } from "@/interfaces/dhbc";
import { Avatar, Badge, Skeleton, Tab, Tabs, Tooltip } from "@heroui/react";
import React, { useCallback, useEffect, useState } from "react";
import EmptyComponent from "../empty/empty";
import { useUser } from "@/providers/user.provider";
import { UserInfo } from "@/interfaces/user";
import { BarChartIcon, TrophyIcon } from "../svg";
import { CommonUtils } from "@/utils/common.utils";

export type DHBCLeaderboardModeType = "latest" | "all_time";

export default function DHBCLeaderboard() {
  const { user } = useUser();

  const [submissionList, setSubmissionList] = useState<DHBCQuizSubmission[]>([]);
  const [leaderboardMode, setLeaderboardMode] = useState<DHBCLeaderboardModeType>("latest");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLatestSubmission = useCallback(async () => {
    setLoading(true);
    await fetch("/api/dhbc/submission/latest")
      .then((res) => res.json())
      .then((result) => {
        if (result.status !== STATUS_CODE.OK) return;

        setSubmissionList(result.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setLoading]);

  const fetchAllTimeSubmission = useCallback(async () => {
    setLoading(true);
    await fetch("/api/dhbc/submission/all-time")
      .then((res) => res.json())
      .then((result) => {
        if (result.status !== STATUS_CODE.OK) return;

        setSubmissionList(result.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setLoading]);

  useEffect(() => {
    if (leaderboardMode === "latest") fetchLatestSubmission();
    else fetchAllTimeSubmission();
  }, [fetchLatestSubmission, fetchAllTimeSubmission, leaderboardMode]);

  return (
    <div className="w-full space-y-2 p-2 lg:max-w-[70vw] xl:max-w-[40vw]">
      <p className="text-sm font-bold">BXH THI ĐẤU</p>

      <Tabs
        variant="underlined"
        selectedKey={leaderboardMode}
        onSelectionChange={(key) => setLeaderboardMode(key as DHBCLeaderboardModeType)}
      >
        <Tab key="latest" title={<p className="text-xs">Trận hôm nay</p>} />
        <Tab key="all_time" title={<p className="text-xs">Mọi thời đại</p>} />
      </Tabs>

      {loading ? (
        <div className="flex flex-col items-stretch gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="aspect-square w-10 rounded-full" />
              <Skeleton className="h-10 flex-3 rounded-md" />
              <Skeleton className="h-10 flex-1 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <LeaderboardTable list={submissionList} leaderboardMode={leaderboardMode} user={user} />
      )}
    </div>
  );
}

const LeaderboardTable = ({
  list,
  leaderboardMode,
  user,
}: {
  list: DHBCQuizSubmission[];
  leaderboardMode: DHBCLeaderboardModeType;
  user: UserInfo | null;
}) => {
  if (!list.length) return <EmptyComponent imageSize={80} title={"Chưa có thí sinh"} />;

  return (
    <div className="relative flex w-full flex-col items-stretch justify-start gap-2 md:max-h-[50vw]">
      {list.map((submission: DHBCQuizSubmission, index) => (
        <div
          key={submission.id}
          className={`flex items-stretch justify-between rounded-md p-2 ${submission.user.id === user?.id && "sticky -bottom-3 bg-sky-200 dark:bg-sky-900"}`}
        >
          <div className="flex items-center gap-2">
            <p className={`mr-2 text-xs font-light`}>{index + 1}</p>
            <Avatar
              src={submission.user.avatar}
              alt={submission.user.display_name}
              size="sm"
              className="shrink-0"
            />
            <div className="flex items-center gap-3">
              <p
                className={`line-clamp-1 font-semibold break-all ${leaderboardMode === "latest" && submission.status === DHBCQuizSubmissionStatus.UNDONE ? "opacity-50" : ""}`}
              >
                {submission.user.display_name}
              </p>
            </div>
          </div>

          <div className="flex items-stretch justify-center gap-2 pl-2">
            {leaderboardMode === "latest" ? (
              <Badge
                content={<span className="md:text-xl">🎯</span>}
                variant="flat"
                shape="circle"
                showOutline={false}
                isOneChar
                hidden={
                  submission.total_trial > 1 || submission.status !== DHBCQuizSubmissionStatus.DONE
                }
              >
                <p
                  className={`${submission.status === DHBCQuizSubmissionStatus.UNDONE ? "bg-default-200 text-default-500" : "bg-green-600 font-semibold text-white"} flex aspect-square min-w-10 items-center justify-center rounded-md px-1.5 py-1 text-sm duration-200`}
                >
                  {submission.total_trial}
                </p>
              </Badge>
            ) : (
              <>
                <Tooltip content="Số đề giải thành công">
                  <div className="relative z-0 min-w-12 rounded-md border-2 border-yellow-300 p-2 text-center text-yellow-500 duration-200 md:min-w-16">
                    <TrophyIcon
                      size={20}
                      className={`absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 px-0.5 ${submission.user.id === user?.id ? "bg-sky-200 dark:bg-sky-900" : "dark:bg-background bg-white"} `}
                    />
                    <p className="font-bold select-none md:text-lg">
                      {submission.allTimeStats?.totalSuccess}
                    </p>
                  </div>
                </Tooltip>

                <Tooltip content="Số dự đoán trung bình">
                  <div className="relative z-0 min-w-12 rounded-md border-2 border-green-600 p-2 text-center text-green-500 duration-200 md:min-w-16">
                    <BarChartIcon
                      size={20}
                      className={`absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 px-0.5 ${submission.user.id === user?.id ? "bg-sky-200 dark:bg-sky-900" : "dark:bg-background bg-white"} `}
                    />
                    <p className="font-bold select-none md:text-lg">
                      {CommonUtils.formatDecimal(submission.allTimeStats?.avgTrials)}
                    </p>
                  </div>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
