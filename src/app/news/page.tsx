"use server";

import { createClient } from "@/lib/supabase/server";
import React from "react";
import NewsFeed from "./NewsFeed";
import { PostInfo } from "@/interfaces/news";
import { checkPermission } from "../auth/users";
import { ROLE } from "@/constants/enums";
import { PaginationProps } from "@/interfaces/common";
import { DEFAULT_PAGE_SIZE } from "@/constants/constants";
import { CommonUtils } from "@/utils/common.utils";
import { SupabaseClient } from "@supabase/supabase-js";

export type PostResponse = PostInfo[];

const CREATE_POST_ENABLED_ROLES = [ROLE.BOT];

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Bảng tin"),
    description: "Tất cả các bản tin được Bot đăng ở HNB",
  };
}

export default async function NewsPage() {
  const supabase = await createClient();

  const posts = await getPosts(supabase, { pageIndex: 1, pageSize: DEFAULT_PAGE_SIZE });
  const canCreate = await checkPermission(supabase, CREATE_POST_ENABLED_ROLES);

  return <NewsFeed posts={posts} canCreate={canCreate} />;
}

export async function getPosts(supabase: SupabaseClient, { pageIndex, pageSize }: PaginationProps) {
  const from = (pageIndex - 1) * pageSize;
  const to = from - 1 + pageSize;

  const NOW = new Date(Date.now()).toISOString();

  const { data: postData, error } = await supabase
    .from("posts")
    .select("*, user: users(id, display_name, avatar)")
    .range(from, to)
    .eq("status", 1)
    .lte("active_at", NOW)
    .order("active_at", { ascending: false })
    .order("is_hot", { ascending: false });

  if (error || !postData) {
    console.log({ error });
    return [];
  }

  const posts: PostResponse = postData.map((post) => ({
    ...post,
    user: post.user ? CommonUtils.getSingleDataFromUnknown(post.user) : null,
  }));

  return posts;
}
