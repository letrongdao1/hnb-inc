"use client";

import React from "react";
import { MemberResponse } from "./page";
import { ROLE } from "@/constants/enums";
import { Avatar, Image } from "@heroui/react";
import ROLE_BG from "@/assets/images/roles/role-bg.jpg";
import BOSS_FEMALE_ART from "@/assets/images/roles/boss-female-art.png";
import BOSS_MALE_ART from "@/assets/images/roles/boss-male-art.jpg";
import BOT_ART from "@/assets/images/roles/robot-art.png";
import SECURITY_ART from "@/assets/images/roles/security-art.png";
import { CrownIcon, RobotIcon, SecurityIcon, UserIcon } from "@/components/svg";
import { RoleUtils } from "@/utils/utils";

export default function SingleMember({ user, roleName }: { user: MemberResponse; roleName: ROLE }) {
  const currentRoleColor = RoleUtils.getRoleColor(roleName);

  const getRoleImageSrc = () => {
    switch (roleName) {
      case ROLE.CEO:
        return user.gender === "M" ? BOSS_MALE_ART.src : BOSS_FEMALE_ART.src;
      case ROLE.BOT:
        return BOT_ART.src;
      case ROLE.SECURITY:
        return SECURITY_ART.src;
      default:
        return "";
    }
  };

  const getRoleIcon = () => {
    switch (roleName) {
      case ROLE.CEO:
        return <CrownIcon fill={currentRoleColor} />;
      case ROLE.BOT:
        return <RobotIcon fill={currentRoleColor} />;
      case ROLE.SECURITY:
        return <SecurityIcon fill={currentRoleColor} />;
      case ROLE.STAFF:
      case ROLE.ADMIN:
      case ROLE.IT:
      case ROLE.HR:
      case ROLE.ATTACHMENT:
        return <UserIcon fill={currentRoleColor || "#FFFFFF"} />;
    }
  };

  const isAnimated = ![ROLE.STAFF, ROLE.ATTACHMENT].some((r) => r === roleName);

  if (!user) return null;

  return (
    <div
      className={`group relative flex ${isAnimated ? "h-24" : "h-16"} w-full cursor-pointer items-stretch justify-start gap-4 overflow-hidden rounded-md object-cover pr-4 transition-all duration-200 ${isAnimated ? "focus-within:h-48 hover:h-48 hover:bg-[length:120%_120%] hover:bg-[center_40%]" : roleName === ROLE.STAFF ? "bg-sky-500/75 hover:bg-sky-500" : "bg-gray-500/75 hover:bg-gray-500"}`}
      style={{
        color: "#FFFFFF",
        backgroundImage: `${isAnimated ? `url(${ROLE_BG.src})` : "unset"}`,
      }}
    >
      <div
        className={`absolute inset-0 z-0 bg-black/50 ${isAnimated && "group-hover:bg-transparent"}`}
      />
      {getRoleImageSrc() && (
        <div className="absolute top-0 left-1/2 h-full shrink-0 -translate-x-1/2">
          <Image
            src={getRoleImageSrc()}
            alt=""
            className={`aspect-[4/3] h-full w-64 rounded-none object-cover object-top shadow-2xl brightness-50 ${isAnimated && "group-hover:scale-125 group-hover:brightness-100"}`}
          />
        </div>
      )}

      <div
        className={`z-10 flex flex-col justify-center gap-2 bg-transparent pl-4 ${isAnimated && ""} lg:pl-8`}
      >
        <div className="flex items-center gap-2 lg:gap-4">
          <Avatar
            isBordered
            src={user.avatar}
            alt="avatar"
            className={`${isAnimated && "group-hover:-translate-y-8"}`}
          />
          <div className={`flex items-center gap-2 ${isAnimated && "group-hover:opacity-0"}`}>
            <p className="font-semibold">{user.display_name}</p>
            <span
              className={`aspect-square w-2 rounded-full ${user.status === 1 ? "bg-green-500" : "bg-gray-500"}`}
            />
          </div>
        </div>
      </div>

      <div
        className={`z-10 ml-auto flex items-center justify-center gap-2 self-center px-2 ${isAnimated && "group-hover:-translate-y-8 group-hover:scale-110"} lg:mr-8`}
      >
        <span
          className={`font-alfa hidden rounded-md bg-transparent text-xl font-black tracking-wider uppercase sm:inline`}
          style={{ color: currentRoleColor }}
        >
          {RoleUtils.getVietSubRoleName(roleName)}
        </span>
        <span className="-translate-y-0.5">{getRoleIcon()}</span>
      </div>
    </div>
  );
}
