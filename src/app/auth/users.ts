"use server";

import { ROLE } from "@/constants/enums";
import { RoleInfo } from "@/interfaces/user";
import { CommonUtils } from "@/utils/common.utils";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserRolesByUserID(
  supabase: SupabaseClient,
  userId?: string
): Promise<RoleInfo[]> {
  const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!currentUserId) return [];

  const { data: roleData, error } = await supabase
    .from("user_roles")
    .select("role:user_roles_role_fkey(*)")
    .eq("user_id", currentUserId);

  if (error) return [];

  const roles = roleData
    ? roleData.map((r) => {
        return CommonUtils.getSingleDataFromUnknown(r.role);
      })
    : [];

  roles.sort((a, b) => (a.name === "STAFF" ? 1 : b.name === "STAFF" ? -1 : 0));

  return roles;
}

export async function checkPermission(
  supabase: SupabaseClient,
  role: ROLE | ROLE[]
): Promise<boolean> {
  if (!role || !role.length) return false;

  const roleData: RoleInfo[] = await getUserRolesByUserID(supabase);

  if (!roleData.length) return false;

  return roleData.some((r) => (Array.isArray(role) ? role.includes(r.name) : r.name === role));
}

export async function getPublicUserList(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, avatar")
    .eq("status", 1);

  if (error || !data) return [];

  const usersWithRole = await Promise.all(
    data.map(async (user) => ({
      ...user,
      roles: await getUserRolesByUserID(supabase, user.id),
    }))
  );

  return usersWithRole;
}
