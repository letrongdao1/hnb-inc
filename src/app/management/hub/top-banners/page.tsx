import { CommonUtils } from "@/utils/common.utils";
import TopBannerManagement from "./TopBannerManagement";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Quản lý banner"),
    description: "Quản lý banner HNB Hub",
  };
}

export default async function TopBannerManagementPage() {
  return <TopBannerManagement />;
}
