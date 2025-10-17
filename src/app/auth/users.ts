"use server";

import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";

export async function getUserRolesByUserID(userId?: string) {
  const supabase = await createClient();
  const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!currentUserId) return;

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
