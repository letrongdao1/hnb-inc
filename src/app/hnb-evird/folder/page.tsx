import { CommonUtils } from "@/utils/common.utils";
import { ROLE, STATUS_CODE } from "@/constants/enums";
import { FolderNode } from "@/lib/s3/folders";
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
  return await fetch(`${process.env.NEXT_SITE_URL}/api/b2/folders?folder=${folder}`)
    .then((res) => res.json())
    .then((result) => {
      if (result.status === STATUS_CODE.OK) {
        return result.data as FolderNode[];
      }
    })
    .catch((err) => {
      console.log({ err });
      return [];
    });
}
