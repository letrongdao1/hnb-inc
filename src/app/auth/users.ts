"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserRolesByUserID(userId: string) {
  const supabase = await createClient();

  const { data: roleData, error } = await supabase
    .from("user_roles")
    .select("role:user_roles_role_fkey(*)")
    .eq("user_id", userId);

  if (error) return [];

  console.log({ roleData });

  const roles = roleData
    ? roleData.map((r) => {
        return r.role as any;
      })
    : [];

  roles.sort((a, b) => (a.name === "STAFF" ? 1 : b.name === "STAFF" ? -1 : 0));

  return roles;
}
