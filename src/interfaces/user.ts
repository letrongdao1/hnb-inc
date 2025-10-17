export interface UserInfo {
  id: string;
  email: string;
  display_name: string;
  gender: "M" | "F";
  avatar: string;
  dob: string;
  phone: string;
  roles: RoleInfo[];
  status: number;
  created_at: string;
}

export interface RoleInfo {
  id: string;
  name: string;
  status: boolean;
}
