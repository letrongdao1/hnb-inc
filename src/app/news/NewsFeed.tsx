"use client";

import React from "react";
import { PostResponse } from "./page";
import SinglePost from "./SinglePost";
import { PageTitle } from "@/components/ui/text";
import EmptyComponent from "@/components/empty/empty";
import { motion } from "framer-motion";

export default function NewsFeed({ posts }: { posts: PostResponse }) {
  return (
    <div className="relative flex w-full flex-col items-stretch gap-4 pb-20 xl:max-w-[60em]">
      <PageTitle>Bảng tin HNB</PageTitle>

      {!posts.length && (
        <EmptyComponent
          title={<>Chưa có bản tin nào &#128564;</>}
          description={`"Có thể Bot đang quá bận ở CLB chăng..."`}
        />
      )}

      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-6 p-6 lg:grid-cols-2"
      >
        {posts.map((post, index) => (
          <SinglePost key={post.id} post={post} isFirst={index === 0} />
        ))}
      </motion.section>
    </div>
  );
}
