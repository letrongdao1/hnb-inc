import { CommonUtils } from "@/utils/common.utils";
import NewsManagement from "./NewsManagement";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Quản lý bảng tin"),
    description: "Quản lý bảng tin HNB Hub",
  };
}

export default async function NewsManagementPage() {
  return <NewsManagement />;
}
