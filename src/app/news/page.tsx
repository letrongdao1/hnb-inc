import { createClient } from "@/lib/supabase/server";
import React from "react";
import NewsFeed from "./NewsFeed";
import { PostInfo } from "@/interfaces/news";
import { PaginationProps } from "@/interfaces/common";
import { DEFAULT_PAGE_SIZE } from "@/constants/constants";
import { CommonUtils } from "@/utils/common.utils";
import { SupabaseClient } from "@supabase/supabase-js";

export type PostResponse = PostInfo[];

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Bảng tin"),
    description: "Tất cả các bản tin được Bot đăng ở HNB",
  };
}

export default async function NewsPage() {
  const supabase = await createClient();

  const { posts, count } = await getInitialPosts(supabase);

  return <NewsFeed posts={posts} count={count || 0} />;
}

export async function getInitialPosts(supabase: SupabaseClient) {
  const { data, count, error } = await supabase
    .from("posts")
    .select("*, user:posts_user_fkey(id, display_name, avatar)", { count: "exact" })
    .eq("status", 1)
    .order("active_at", { ascending: false })
    .order("is_hot", { ascending: false })
    .range(0, DEFAULT_PAGE_SIZE - 1);

  if (error || !data) {
    return { posts: [], count: 0 };
  }

  const posts = await Promise.all(
    data.map(async (post: any) => ({
      ...post,
      user: post.user ? CommonUtils.getSingleDataFromUnknown(post.user) : null,
      seenBy:
        (
          await supabase
            .from("post_seen")
            .select("*, user:post_seen_user_fkey(id, display_name, avatar)")
            .eq("post", post.id)
        ).data || [],
    }))
  );

  return { posts, count };
}
