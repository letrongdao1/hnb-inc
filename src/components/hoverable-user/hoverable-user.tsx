"use client";

import { getCurrentUserInfo } from "@/app/auth/actions";
import { UserInfo } from "@/interfaces/user";
import { CommonUtils } from "@/utils/common.utils";
import { Avatar, Skeleton, Tooltip } from "@heroui/react";
import React, { useEffect, useState } from "react";
import Loader from "../loader";
import { BirthdayIcon } from "../svg";
import dayjs from "dayjs";
import { GLOBAL_DATE_FORMAT, SUPABASE_DATE_FORMAT } from "@/constants/constants";
import { RoleUtils } from "@/utils/role.utils";
import { ROLE } from "@/constants/enums";

const PopupProfile = ({ userId }: { userId?: string }) => {
  const [user, setUser] = useState<UserInfo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    getCurrentUserInfo()
      .then((res) => {
        if (res) setUser(res);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading)
    return (
      <div className="w-56 space-y-1 py-2 overflow-hidden">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-5 w-3/5 rounded-lg bg-black" />
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
    <div className="flex w-56 flex-col items-stretch gap-2 p-1 text-black">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar src={user.avatar} alt="avatar" isBordered size="sm" />
          <p className="pr-1 pl-2 font-semibold group-hover:underline">{user.display_name}</p>
          {user.status === 1 && (
            <span className="ml-1 aspect-square w-1 rounded-full bg-green-500" />
          )}
        </div>

        <p
          className={`rounded-md p-1 text-white`}
          style={{ backgroundColor: RoleUtils.getRoleColor(user.roles[0]?.name as ROLE) }}
        >
          {RoleUtils.getVietSubRoleName(user.roles[0]?.name as ROLE)}
        </p>
      </div>

      <div className="flex scale-75 flex-col gap-1">
        {user.email && (
          <div className="flex items-center gap-2">
            <BirthdayIcon />
            {user.email}
          </div>
        )}
        {user.dob && (
          <div className="flex items-center gap-2">
            <BirthdayIcon />
            {dayjs(user.dob, SUPABASE_DATE_FORMAT).format(GLOBAL_DATE_FORMAT)}
          </div>
        )}
      </div>
    </div>
  );
};

export default function HoverableUser({ user }: { user: Partial<UserInfo> | null }) {
  const [isYou, setIsYou] = useState<boolean>(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);

  useEffect(() => {
    CommonUtils.checkIsYou(user?.id).then((res) => {
      setIsYou(res);
    });
  }, [user]);

  if (!user) return;

  return (
    <Tooltip
      content={<PopupProfile userId={user.id} />}
      offset={10}
      delay={500}
      closeDelay={0}
      isOpen={isTooltipOpen}
      onOpenChange={(isOpen) => {
        if (isYou) setIsTooltipOpen(isOpen);
      }}
    >
      <button
        className={`group flex ${isTooltipOpen ? "cursor-pointer" : "cursor-progress"} items-center`}
      >
        <Avatar src={user.avatar} alt="avatar" isBordered size="sm" />
        <p className="pr-1 pl-2 font-semibold group-hover:underline">{user.display_name}</p>
        <p className="text-sm italic opacity-70">{isYou && "(Bạn)"}</p>
      </button>
    </Tooltip>
  );
}
