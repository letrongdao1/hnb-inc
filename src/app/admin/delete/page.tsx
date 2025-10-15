"use server";

import { createClient } from "@/lib/supabase/server";
import Delete from "./Delete";

export default async function DeleteUser(userId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    const { error } = await supabase.auth.admin.deleteUser(userData.user.id);
    if (error) throw error;
    console.log(`Deleted user: ${userId}`);
  }

  return <Delete />;
}
