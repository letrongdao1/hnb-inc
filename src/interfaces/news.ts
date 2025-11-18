import { BaseUserInfo } from "./user";

export interface BasePostInfo {
  id: string;
  user: BaseUserInfo;
  title: string;
  slug: string;
  active_at: string;
}
export interface PostInfo extends BasePostInfo {
  description?: string;
  content: string;
  image?: string;
  is_hot?: boolean;
  status: number;
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
  post: BasePostInfo;
  user: BaseUserInfo;
  content: string;
  parent_id?: string;
  children?: PostComment[];
  like_count: number;
  dislike_count: number;
  status: number;
  created_at: string;
  updated_at: string;
}
