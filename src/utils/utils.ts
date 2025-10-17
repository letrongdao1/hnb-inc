import { ROLE } from "@/constants/enums";

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
};
