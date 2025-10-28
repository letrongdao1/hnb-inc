"use client";

import React from "react";
import { MemberResponse } from "./page";
import { PageTitle } from "@/components/text/text";
import { ROLE } from "@/constants/enums";
import SingleMember from "./SingleMember";
import { Divider } from "@heroui/react";

const UPPER_ROLES: ROLE[] = [ROLE.IT, ROLE.HR, ROLE.BOT, ROLE.SECURITY];

export default function MembersList({ members }: { members: MemberResponse[] }) {
  const getMembersListByRole = (roleList: ROLE[]) =>
    members.filter((m) =>
      m.roles.some((role, index) => index === 0 && roleList.some((item) => item === role.name))
    );

  return (
    <div className="flex min-h-screen w-full max-w-[50em] flex-col items-stretch gap-2">
      <PageTitle>Danh sách thành viên HNB</PageTitle>

      {getMembersListByRole([ROLE.CEO]).map((user) => (
        <SingleMember key={user.id} user={user} roleName={ROLE.CEO} />
      ))}

      {getMembersListByRole([ROLE.CEO]).length && (
        <Divider className="mx-auto my-4 w-5/6 bg-gray-400 opacity-75" />
      )}

      {getMembersListByRole(UPPER_ROLES).map((user) => (
        <SingleMember key={user.id} user={user} roleName={user.roles[0].name} />
      ))}

      {getMembersListByRole(UPPER_ROLES).length && (
        <Divider className="mx-auto my-4 w-5/6 bg-gray-400 opacity-75" />
      )}

      {getMembersListByRole([ROLE.STAFF]).map((user) => (
        <SingleMember key={user.id} user={user} roleName={user.roles[user.roles.length - 1].name} />
      ))}
      {getMembersListByRole([ROLE.ATTACHMENT]).map((user) => (
        <SingleMember key={user.id} user={user} roleName={user.roles[user.roles.length - 1].name} />
      ))}
    </div>
  );
}
