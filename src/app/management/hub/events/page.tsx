import { CommonUtils } from "@/utils/common.utils";
import EventsManagement from "./EventsManagement";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Quản lý sự kiện"),
    description: "Quản lý sự kiện HNB Hub",
  };
}

export default async function EventManagementPage() {
  return <EventsManagement />;
}
