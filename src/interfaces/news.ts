import { BaseUserInfo } from "./user";

export interface PostInfo {
  id: string;
  user: {
    id: string;
    display_name?: string;
    avatar?: string;
  } | null;
  title: string;
  slug: string;
  description?: string;
  content: string;
  image?: string;
  is_hot?: boolean;
  status: number;
  active_at: string;
  created_at: string;
  seenBy?: {
    post: string;
    user: BaseUserInfo;
    created_at: string;
  }[];
  commentList?: PostComment[];
}

export interface PostComment {
  id: string;
  post: string;
  user: BaseUserInfo;
  content: string;
  children?: PostComment[];
  like_count: number;
  dislike_count: number;
  status: number;
  created_at: string;
  updated_at: string;
}
