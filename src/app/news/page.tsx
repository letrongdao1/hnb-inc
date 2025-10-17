"use server";

import { createClient } from "@/lib/supabase/server";
import React from "react";
import NewsFeed from "./NewsFeed";
import { PostInfo } from "@/interfaces/news";
import { getUserRolesByUserID } from "../auth/users";
import { ROLE } from "@/constants/enums";
import { RoleInfo } from "@/interfaces/user";
import { PaginationProps } from "@/interfaces/common";
import { DEFAULT_PAGE_SIZE } from "@/constants/constants";
import { CommonUtils } from "@/utils/common.utils";

export type PostResponse = PostInfo[];

const CREATE_POST_ENABLED_ROLES = [ROLE.BOT];

export async function generateMetadata() {
  return {
    title: `Bảng tin HNB`,
    description: "Tất cả các bản tin được Bot đăng ở HNB",
  };
}

export default async function NewsPage() {
  const roleData: RoleInfo = (await getUserRolesByUserID())?.[0];

  const canCreate = CREATE_POST_ENABLED_ROLES.some((role) => roleData.name === role);

  const posts = await getPosts({ pageIndex: 1, pageSize: DEFAULT_PAGE_SIZE });

  return <NewsFeed posts={posts} canCreate={canCreate} />;
}

export async function getPosts({ pageIndex, pageSize }: PaginationProps) {
  const supabase = await createClient();

  const from = (pageIndex - 1) * pageSize;
  const to = from - 1 + pageSize;

  const { data: postData } = await supabase
    .from("posts")
    .select(
      "id, user:news_user_fkey(id, display_name, avatar), title, description, content, image, status, active_at, created_at"
    )
    .range(from, to);

  const posts: PostResponse = postData
    ? await Promise.all(
        postData.map((post) => ({
          ...post,
          user: post.user ? CommonUtils.getSingleDataFromUnknown(post.user) : null,
        }))
      )
    : [];

  return posts;
}
