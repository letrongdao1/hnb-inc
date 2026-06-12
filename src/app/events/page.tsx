import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { SupabaseClient } from "@supabase/supabase-js";
import React from "react";
import AllEventsPage from "@/components/events/AllEventsPage";
import { Event } from "@/interfaces/events";
import { getCurrentUserId } from "../auth/actions";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Trang sự kiện"),
    description: "Trang sự kiện",
  };
}

export default async function EventPage() {
  const supabase = await createClient();
  const events = await getEventList(supabase);

  return <AllEventsPage events={events} />;
}

export async function getEventList(supabase: SupabaseClient): Promise<Event[]> {
  const userId = await getCurrentUserId();

  const { data: eventData, error } = await supabase
    .from("events")
    .select("*, will_pay_user:events_will_pay_user_fkey(id, display_name, avatar)")
    .order("status", { ascending: true })
    .order("start_at", { ascending: false });

  if (error || !eventData) {
    console.log(error);
    return [];
  }

  const extendedEventData = await Promise.all(
    eventData.map(async (event) => {
      const participants = await getEventParticipation(supabase, event.id);

      return {
        ...event,
        is_will_pay_user: event.will_pay_user?.id === userId,
        participants,
        is_joined: participants.some((p) => p.user.id === userId),
      };
    })
  );

  return extendedEventData;
}

export async function getEventParticipation(supabase: SupabaseClient, eventId: string) {
  if (!eventId) return [];

  const { data } = await supabase
    .from("event_participation")
    .select("*, user:users(id, display_name, avatar)")
    .eq("event", eventId)
    .order("created_at", { ascending: true });

  if (!data) return [];

  const parsedData = data.map((p) => ({
    ...p,
    user: CommonUtils.getSingleDataFromUnknown(p.user),
  }));

  return parsedData;
}
