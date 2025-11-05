"use server";

import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { Metadata } from "next";
import EventInfoPage from "./EventInfoPage";
import { Event } from "@/interfaces/events";
import { getEventParticipation } from "../page";
import { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentUserId } from "@/app/auth/actions";

interface EventDetailProps {
  params: Promise<{ slug: string }>;
}

export async function getEvent(supabase: SupabaseClient, slug: string) {
  const { data: event } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();

  return event || null;
}

export async function generateMetadata({ params }: EventDetailProps): Promise<Metadata> {
  const supabase = await createClient();
  const { slug } = await params;
  const event: Event = await getEvent(supabase, slug);

  if (!event) return { title: "Không tìm thấy sự kiện" };

  return {
    title: CommonUtils.formatMetaData(event.title),
    description: "",
  };
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  const { slug } = await params;
  const event: Event = await getEvent(supabase, slug);

  const participants = await getEventParticipation(supabase, event.id);

  const parsedEvent = {
    ...event,
    participants,
    is_joined: participants.some((p) => p.user.id === userId),
  };

  return <EventInfoPage event={parsedEvent || null} />;
}
