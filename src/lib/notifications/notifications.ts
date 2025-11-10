"use server";

import { getCurrentUserId } from "@/app/auth/actions";
import { createClient } from "../supabase/server";
import { Notification } from "@/interfaces/common";
import { ROLE } from "@/constants/enums";
import { SupabaseClient } from "@supabase/supabase-js";
import { getUserRolesByUserID } from "@/app/auth/users";

export type RecipientTypeEnum = { recipientType: "ALL" | string | ROLE[] };

async function getTargetRecipients({ recipientType }: RecipientTypeEnum) {
  const supabase = await createClient();

  let recipientList: { id: string }[] = [];

  const { data, error } = await supabase.from("users").select("id").eq("status", 1);

  if (error || !data) return [];

  if (recipientType === "ALL") {
    recipientList = data;
  } else if (Array.isArray(recipientType)) {
  } else if (Object.values(ROLE).includes(recipientType as ROLE)) {
    const roleData = await Promise.all(
      data
        .map(async (item: { id: string }) => {
          const roles = await getUserRolesByUserID(supabase, item.id);
          if (roles.some((role) => role.id === recipientType)) {
            return item;
          }
        })
        .filter(Boolean)
    );
  }
}

export async function sendNotificationFromSystem({
  supabase,
  title,
  description,
  href,
  recipientType,
}: Notification & RecipientTypeEnum & { supabase: SupabaseClient }) {
  const userId = await getCurrentUserId();

  if (!userId) return;

  const newNotification: Partial<Notification> = {
    user: userId,
    title,
    description,
    href,
  };

  const { error } = await supabase.from("notifications").insert(newNotification);

  if (error) throw new Error(error.message);
}
