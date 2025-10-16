export interface UserInfo {
  id: string;
  email: string;
  display_name: string;
  gender: "M" | "F";
  avatar: string;
  dob: string;
  phone: string;
  roles: {
    id: string;
    name: string;
    status: boolean;
  }[];
  status: number;
  created_at: string;
}
