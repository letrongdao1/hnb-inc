"use client";

import { getCurrentUserInfo } from "@/app/auth/actions";
import { UserInfo } from "@/interfaces/user";
import { CommonUtils } from "@/utils/common.utils";
import { Avatar, Popover, PopoverContent, PopoverTrigger, Skeleton, Tooltip } from "@heroui/react";
import React, { useEffect, useState } from "react";
import { BirthdayIcon, EmailIcon, PhoneIcon } from "../svg";
import dayjs from "dayjs";
import { GLOBAL_DATE_FORMAT, SUPABASE_DATE_FORMAT } from "@/constants/constants";
import { RoleUtils } from "@/utils/role.utils";
import { ROLE } from "@/constants/enums";
import EmptyComponent from "../empty/empty";

export default function HoverableUser({ user }: { user: Partial<UserInfo> | null }) {
  const [isYou, setIsYou] = useState<boolean>(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserInfo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    CommonUtils.checkIsYou(user?.id).then((res) => {
      setIsYou(res);
    });
  }, [user]);

  const LoadingSkeleton = () => (
    <div className="w-56 space-y-1 overflow-hidden py-2">
      <Skeleton className="w-3/5 rounded-lg">
        <div className="h-5 w-3/5 rounded-lg" />
      </Skeleton>
      <Skeleton className="w-4/5 rounded-lg">
        <div className="h-3 w-4/5 rounded-lg bg-gray-500" />
      </Skeleton>
      <Skeleton className="w-2/5 rounded-lg">
        <div className="h-3 w-2/5 rounded-lg bg-gray-500" />
      </Skeleton>
    </div>
  );

  if (!user) return;

  return (
    <Popover
      offset={10}
      isOpen={isTooltipOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          if (isYou) setIsTooltipOpen(isOpen);
          setIsLoading(true);
          getCurrentUserInfo()
            .then((res) => {
              if (res) setUserData(res);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setIsTooltipOpen(false);
        }
      }}
    >
      <PopoverTrigger>
        <button className={`group flex cursor-pointer items-center`}>
          <Avatar src={user.avatar} alt="avatar" isBordered size="sm" />
          <p className="pr-1 pl-2 font-semibold group-hover:underline">{user.display_name}</p>
          <p className="text-sm italic opacity-70">{isYou && "(Bạn)"}</p>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : !userData ? (
          <EmptyComponent />
        ) : (
          <div className="flex w-56 flex-col items-stretch gap-2 p-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar src={userData.avatar} alt="avatar" isBordered size="sm" />
                <p className="pr-1 pl-2 font-semibold group-hover:underline">
                  {userData.display_name}
                </p>
                {userData.status === 1 && (
                  <span className="ml-1 aspect-square w-1 rounded-full bg-green-500" />
                )}
              </div>

              <p
                className={`rounded-md p-1 text-white`}
                style={{ backgroundColor: RoleUtils.getRoleColor(userData.roles[0]?.name as ROLE) }}
              >
                {RoleUtils.getVietSubRoleName(userData.roles[0]?.name as ROLE)}
              </p>
            </div>

            <div className="flex scale-75 flex-col gap-1">
              {userData.email && (
                <div className="flex items-center gap-2">
                  <EmailIcon />
                  {userData.email}
                </div>
              )}
              {userData.phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon />
                  {CommonUtils.formatPhoneNumber(userData.phone)}
                </div>
              )}
              {userData.dob && (
                <div className="flex items-center gap-2">
                  <BirthdayIcon />
                  {dayjs(userData.dob, SUPABASE_DATE_FORMAT).format(GLOBAL_DATE_FORMAT)}
                </div>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
