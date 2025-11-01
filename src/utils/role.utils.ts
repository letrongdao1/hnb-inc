import { ROLE } from "@/constants/enums";
import { UserInfo } from "@/interfaces/user";

export const RoleUtils = {
  getVietSubRoleName: (roleName: ROLE) => {
    switch (roleName) {
      case ROLE.STAFF:
        return "Nhân viên";
      case ROLE.ADMIN:
        return "Admin";
      case ROLE.CEO:
        return "Chủ tịch";
      case ROLE.BOT:
        return "Bot";
      case ROLE.SECURITY:
        return "Bảo an";
      case ROLE.IT:
        return "IT";
      case ROLE.HR:
        return "HR";
      case ROLE.ATTACHMENT:
        return "Tệp đính kèm";
    }
  },
  getRoleColor: (roleName: ROLE) => {
    switch (roleName) {
      case ROLE.CEO:
        return "#FF0000";
      case ROLE.BOT:
        return "#14BA35";
      case ROLE.SECURITY:
        return "#BA8B14";
      case ROLE.IT:
        return "#1468B8";
      case ROLE.HR:
        return "#B8148C";
      case ROLE.ADMIN:
      case ROLE.STAFF:
      case ROLE.ATTACHMENT:
        return "";
    }
  },
  checkIsRole: (user: UserInfo, role: ROLE | ROLE[]) => {
    if (!user || !user.roles || !user.roles.length) return false;

    if (Array.isArray(role)) {
      const roleString = role.join(",");

      return user.roles.some((r) => roleString.includes(r.name));
    } else {
      return user.roles.some((r) => role === r.name);
    }
  },
};
