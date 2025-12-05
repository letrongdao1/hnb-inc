import { FileUtils } from "@/utils/file.utils";
import EvirdFolderContentPage from "../../../../components/hnb-evird/folder";
import { getFolderList } from "../page";

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return {
    title: `${FileUtils.getCurrentFolderNameByRelativePath(path.join("/"))} - HNB Evird | HNB Hub`,
    description: "HNB Evird - Nơi lưu giữ những dữ liệu của HNB trên đám mây",
  };
}

export default async function Evird({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;

  const folderList = await getFolderList(path.join("/"));

  return <EvirdFolderContentPage folderList={folderList || []} />;
}
