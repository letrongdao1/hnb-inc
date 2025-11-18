"use server";

import { getCurrentUserId } from "@/app/auth/actions";
import { createClient } from "../supabase/server";
import { Notification } from "@/interfaces/common";
import { NOTIFICATION_TYPE, ROLE, STATUS_CODE } from "@/constants/enums";
import { SupabaseClient } from "@supabase/supabase-js";
import { getUserRolesByUserID } from "@/app/auth/users";

// export type NotificationType = { recipientType: "ALL" | string | ROLE[] };

// async function getTargetRecipients({ recipientType }: RecipientTypeEnum) {
//   const supabase = await createClient();

//   let recipientList: { id: string }[] = [];

//   const { data, error } = await supabase.from("users").select("id").eq("status", 1);

//   if (error || !data) return [];

//   if (recipientType === "ALL") {
//     recipientList = data;
//   } else if (typeof recipientType === "string") {

//   } else if (Array.isArray(recipientType)) {
//   } else if (Object.values(ROLE).includes(recipientType as ROLE)) {
//     const roleData = await Promise.all(
//       data
//         .map(async (item: { id: string }) => {
//           const roles = await getUserRolesByUserID(supabase, item.id);
//           if (roles.some((role) => role.id === recipientType)) {
//             return item;
//           }
//         })
//         .filter(Boolean)
//     );
//   }
// }

export async function notifyAllActiveUser({
  supabase,
  title,
  description,
  href,
  type,
  from_user,
  ref_id,
}: Partial<Notification> & { supabase: SupabaseClient }) {
  const { error } = await supabase.rpc("notify_all_active_users", {
    p_from_user: from_user || null,
    p_title: title,
    p_description: description,
    p_href: href,
    p_type: type || NOTIFICATION_TYPE.GENERAL,
    p_ref_id: ref_id || null,
  });

  if (error) {
    console.log({ error });
    throw new Error("Lỗi gửi thông báo!");
  } else {
    return { status: STATUS_CODE.OK };
  }
}

export async function notifySpecificUser({
  supabase,
  user,
  title,
  description,
  href,
  type,
  from_user,
  ref_id,
}: {
  supabase: SupabaseClient;
  from_user: string | null;
  user: string;
  title: string;
  description?: string;
  href?: string;
  type: NOTIFICATION_TYPE;
  ref_id: string | null;
}) {
  const hasSentNoti = await hasSentNotificationRecently({
    supabase,
    userId: user,
    type,
    ref_id: ref_id || null,
  });

  if (hasSentNoti) return;

  const newNotification: Partial<Notification> = {
    from_user,
    user,
    title,
    description,
    type,
    href,
    ref_id,
  };

  const { error } = await supabase.from("notifications").insert(newNotification);

  if (error) {
    console.log({ error });
    throw new Error("Lỗi gửi thông báo!");
  } else {
    return { status: STATUS_CODE.OK };
  }
}

export async function hasSentNotificationRecently({
  supabase,
  userId,
  type,
  ref_id,
}: {
  supabase: SupabaseClient;
  userId: string;
  type: NOTIFICATION_TYPE;
  ref_id: string | null;
}) {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user", userId)
    .eq("type", type)
    .eq("ref_id", ref_id)
    .gte("created_at", oneMinuteAgo)
    .limit(1);

  if (error || !data) {
    console.error(error);
    return false;
  }

  return data.length > 0;
}
