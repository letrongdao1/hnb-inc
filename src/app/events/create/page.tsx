import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import CreateEventForm from "./CreateEventForm";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Tạo sự kiện"),
    description: "Tạo sự kiện",
  };
}

export default async function page() {
  const supabase = await createClient();

  const { data: tagsData, error } = await supabase
    .from("tags")
    .select("*")
    .order("id", { ascending: false });

  return <CreateEventForm tags={tagsData || []} />;
}
