"use client";

import React from "react";
import { PostResponse } from "./page";
import { Button } from "@heroui/react";
import { PlusIcon } from "@/components/svg";
import SinglePost from "./SinglePost";
import { PageTitle } from "@/components/text/text";

export default function NewsFeed({
  posts,
  canCreate,
}: {
  posts: PostResponse;
  canCreate: boolean;
}) {
  console.log({ posts });

  return (
    <div className="relative flex w-full flex-col items-stretch gap-4 border xl:max-w-[60em]">
      <PageTitle>Bảng tin HNB</PageTitle>

      {Boolean(canCreate) && (
        <div className="fixed right-4 bottom-12 xl:right-16">
          <Button variant="solid" color="success" startContent={<PlusIcon fill="#FFFFFF" />} isIconOnly />
        </div>
      )}

      <div className="flex flex-col items-stretch justify-start gap-2">
        {posts.map((post) => (
          <SinglePost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
