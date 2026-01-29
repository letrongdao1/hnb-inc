import { ROLE } from "@/constants/enums";
import { getCurrentUserInfo } from "../auth/actions";
import { RoleUtils } from "@/utils/role.utils";
import Forbidden403 from "@/components/403";
import { PageTitle } from "@/components/ui/text";

export default async function DHBCLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserInfo();
  if (user && !RoleUtils.checkIsRole(user, ROLE.STAFF)) {
    return <Forbidden403 />;
  }

  return <>{children}</>;
}
