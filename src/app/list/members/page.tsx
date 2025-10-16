"use server";

import ErrorComponent from "@/components/error/error";
import { createClient } from "@/lib/supabase/server";
import MembersList from "./MembersList";

export interface MemberResponse {
  id: string;
  display_name: string;
  avatar: string;
  dob: string;
  role: {
    id: string;
    name: string;
    status: boolean;
  }[];
  status: number;
  created_at: string;
}

export default async function Members() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, avatar, dob, status, role:users_role_fkey(id, name, status), created_at")
    .order("created_at", { ascending: true });

  if (error) return <ErrorComponent error={error.message} />;

  return <MembersList members={data} />
}
