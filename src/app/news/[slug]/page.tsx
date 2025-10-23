"use server";

import { STATUS_CODE } from "@/constants/enums";
import { PostInfo } from "@/interfaces/news";
import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { Metadata } from "next";
import PostInfoPage from "./PostInfo";

interface PostDetailProps {
  params: { slug: string };
}

export async function getPost(slug: string) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("*, user: users(id, display_name, avatar)")
    .eq("slug", slug)
    .maybeSingle();

  return post || null;
}

export async function generateMetadata({ params }: PostDetailProps): Promise<Metadata> {
  const post: PostInfo = await getPost(params.slug);

  if (!post) return { title: "Không tìm thấy bản tin" };

  return {
    title: CommonUtils.formatMetaData(post.title),
    description: "",
  };
}

export default async function PostDetailPage({ params }: PostDetailProps) {
  const post: PostInfo = await getPost(params.slug);

  return <PostInfoPage post={post || null} />;
}
