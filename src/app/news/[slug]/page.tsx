"use server";

import { STATUS_CODE } from "@/constants/enums";
import { PostInfo } from "@/interfaces/news";
import { createClient } from "@/lib/supabase/server";
import { CommonUtils } from "@/utils/common.utils";
import { Metadata } from "next";
import PostInfoPage from "./PostInfo";
import { getCurrentUserId } from "@/app/auth/actions";

interface PostDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post: PostInfo = await getPost(slug);

  if (!post) return { title: "Không tìm thấy bản tin" };

  return {
    title: CommonUtils.formatMetaData(post.title),
    description: "",
  };
}

export default async function PostDetailPage({ params }: PostDetailProps) {
  const { slug } = await params;
  const post: PostInfo = await getPost(slug);
  await markSeenPost(slug);

  return <PostInfoPage post={post || null} />;
}

export async function getPost(slug: string) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("*, user:posts_user_fkey(id, display_name, avatar)")
    .eq("slug", slug)
    .maybeSingle();

  return post || null;
}

export async function markSeenPost(slug: string) {
  const supabase = await createClient();
  const post: PostInfo = await getPost(slug);
  const userId = await getCurrentUserId();

  if (!post || !userId) {
    console.log("Lỗi cập nhật trạng thái xem bản tin!");
    return;
  }

  await supabase.from("post_seen").upsert({
    post: post.id,
    user: userId,
  });
}
