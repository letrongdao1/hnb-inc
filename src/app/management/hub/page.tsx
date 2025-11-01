import { CommonUtils } from "@/utils/common.utils";
import HubManagementPage from "./HubManagementPage";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Quản lý nội dung"),
    description: "Quản lý nội dung",
  };
}

export default async function HubManagement() {
  return <HubManagementPage />;
}
