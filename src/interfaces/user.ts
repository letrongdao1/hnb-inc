import { ROLE } from "@/constants/enums";

export interface BaseUserInfo {
  id: string;
  display_name: string;
  avatar: string;
}
export interface UserInfo extends BaseUserInfo {
  email: string;
  gender: "M" | "F";
  dob: string;
  phone: string;
  roles: RoleInfo[];
  status: number;
  created_at: string;
}

export interface RoleInfo {
  id: string;
  name: ROLE;
  status: boolean;
}
