import { UserInfo } from "./user";

export interface PostInfo {
  id: string;
  user: {
    id: string;
    display_name: string;
  } | null;
  title: string;
  description?: string;
  content: string;
  image?: string;
  status: number;
  active_at: string;
  created_at: string;
}
