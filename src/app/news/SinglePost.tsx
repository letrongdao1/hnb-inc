"use client";

import { PostInfo } from "@/interfaces/news";

export default function SinglePost({ post }: { post: PostInfo }) {
  return <div>{post.title} {post.user?.display_name}</div>;
}
