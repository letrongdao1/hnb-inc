"use server";

import { createClient } from "@/lib/supabase/server";
import React from "react";
import NewsFeed from "./NewsFeed";
import { PostInfo } from "@/interfaces/news";
import EmptyComponent from "@/components/empty/empty";
import { getUserRolesByUserID } from "../auth/users";
import { ROLE } from "@/constants/enums";
import { RoleInfo } from "@/interfaces/user";

export type PostResponse = PostInfo[];

const CREATE_POST_ENABLED_ROLES = [ROLE.BOT];

export default async function NewsPage() {
  const supabase = await createClient();

  const roleData: RoleInfo = (await getUserRolesByUserID())?.[0];

  const canCreate = CREATE_POST_ENABLED_ROLES.some((role) => roleData.name === role);

  const { data: postData, error } = await supabase
    .from("posts")
    .select(
      "id, user:news_user_fkey(id, display_name), title, description, content, image, status, active_at, created_at"
    )
    .limit(10);

    console.log({postData})

  const posts: PostResponse = postData
    ? await Promise.all(
        postData.map((post) => ({
          ...post,
          user: post.user ? post.user[0] : null,
        }))
      )
    : [];

  return <NewsFeed posts={posts} canCreate={canCreate} />;
}
