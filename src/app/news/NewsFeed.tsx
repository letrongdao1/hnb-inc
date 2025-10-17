"use client";

import React from "react";
import { PostResponse } from "./page";
import { Button } from "@heroui/react";
import { PlusIcon } from "@/components/svg";
import SinglePost from "./SinglePost";
import { PageTitle } from "@/components/text/text";
import EmptyComponent from "@/components/empty/empty";

export default function NewsFeed({
  posts,
  canCreate,
}: {
  posts: PostResponse;
  canCreate: boolean;
}) {
  return (
    <div className="relative flex w-full flex-col items-stretch gap-4 border-b xl:max-w-[60em]">
      <PageTitle>Bảng tin HNB</PageTitle>

      {Boolean(canCreate) && (
        <div className="fixed right-4 bottom-12 xl:right-16">
          <button className="group flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-sky-600 px-3 transition-all duration-300 ease-in-out hover:w-44 hover:bg-sky-800">
            <PlusIcon fill="#FFFFFF" />
            <span className="ml-2 hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-in-out group-hover:block group-hover:opacity-100">
              Tạo bản tin mới
            </span>
          </button>
        </div>
      )}

      {posts.length === 0 && <EmptyComponent />}

      <div className="flex flex-col items-stretch justify-start gap-2">
        {posts.map((post) => (
          <SinglePost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
