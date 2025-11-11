"use server";

import ErrorComponent from "@/components/error/error";
import { createClient } from "@/lib/supabase/server";
import MembersList from "./MembersList";
import { getUserRolesByUserID } from "@/app/auth/users";
import { ROLE } from "@/constants/enums";

export interface MemberResponse {
  id: string;
  display_name: string;
  avatar: string;
  dob: string;
  gender: "M" | "F";
  roles: {
    id: string;
    name: ROLE;
    status: boolean;
  }[];
  status: number;
  created_at: string;
}

export async function generateMetadata() {
  return {
    title: `Danh sách thành viên HNB`,
    description: "Danh sách thành viên HNB",
  };
}

export default async function Members() {
  const supabase = await createClient();

  const { data: userData, error } = await supabase
    .from("users")
    .select("id, display_name, gender, avatar, dob, status, created_at")
    .order("created_at", { ascending: true });

  const userDataWithRoles: MemberResponse[] = !userData
    ? []
    : await Promise.all(
        userData.map(async (data) => {
          return {
            ...data,
            roles: await getUserRolesByUserID(supabase, data.id) || [],
          };
        })
      );

  if (error) return <ErrorComponent error={error.message} />;

  return <MembersList members={userDataWithRoles} />;
}
