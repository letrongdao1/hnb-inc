import { CommonUtils } from "@/utils/common.utils";
import { ROLE } from "@/constants/enums";
import { listFolders } from "@/lib/s3/folders";
import Forbidden403 from "@/components/403";
import { RoleUtils } from "@/utils/role.utils";
import { getCurrentUserInfo } from "@/app/auth/actions";
import EvirdFolderContentPage from "@/components/hnb-evird/folder";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("HNB Evird"),
    description: "HNB Evird - Nơi lưu giữ những dữ liệu của HNB trên đám mây",
  };
}

export default async function Evird() {
  const user = await getCurrentUserInfo();
  if (user && !RoleUtils.checkIsRole(user, ROLE.STAFF)) {
    return <Forbidden403 />;
  }

  const folderList = await getFolderList();

  return <EvirdFolderContentPage folderList={folderList || []} />;
}

export async function getFolderList(folder: string = "") {
  const folders = await listFolders(folder);

  return folders.map((path) => {
    const parts = path.split("/").filter(Boolean);
    const subFolderName = parts[parts.length - 1];
    return { label: subFolderName, path };
  });
}
