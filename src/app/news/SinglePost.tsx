"use client";

import HoverableUser from "@/components/hoverable-user/hoverable-user";
import { PostInfo } from "@/interfaces/news";

export default function SinglePost({ post }: { post: PostInfo }) {
  return (
    <div className="flex flex-col items-stretch gap-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col overflow-hidden lg:max-w-11/12">
          <p>{post.title}</p>
          <p>{post.description}</p>
        </div>

        <div>
          <HoverableUser user={post.user} />
        </div>
      </div>
    </div>
  );
}
