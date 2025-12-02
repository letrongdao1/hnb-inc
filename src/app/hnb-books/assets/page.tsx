import { CommonUtils } from "@/utils/common.utils";
import AssetsPage from "./AssetsPage";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("HNB Book"),
    description: "HNB Book - Nơi lưu giữ những điều tạo nên HNB",
  };
}

export default async function Home() {
  return <AssetsPage />;
}
