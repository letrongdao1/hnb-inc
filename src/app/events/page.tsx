import Maintenance from "@/components/maintenance";
import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { SupabaseClient } from "@supabase/supabase-js";
import React from "react";
import AllEventsPage from "./AllEventsPage";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Trang sự kiện"),
    description: "Trang sự kiện",
  };
}

export default async function page() {
  const supabase = await createClient();
  const events = await getEventList(supabase);

  return <AllEventsPage events={events} />;
}

export async function getEventList(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data;
}
