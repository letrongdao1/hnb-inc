"use client";

import React, { useState } from "react";
import { PostResponse } from "./page";
import { PlusIcon } from "@/components/svg";
import SinglePost from "./SinglePost";
import { PageTitle } from "@/components/text/text";
import EmptyComponent from "@/components/empty/empty";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";

export default function NewsFeed({
  posts,
  canCreate,
}: {
  posts: PostResponse;
  canCreate: boolean;
}) {
  const pathName = usePathname();
  const router = useRouter();

  const [isHoverAdd, setIsHoverAdd] = useState<boolean>(false);

  return (
    <div className="relative flex w-full flex-col items-stretch gap-4 pb-20 xl:max-w-[60em]">
      <PageTitle>Bảng tin HNB</PageTitle>

      {Boolean(canCreate) && (
        <motion.div
          layout
          onMouseEnter={() => setIsHoverAdd(true)}
          onMouseLeave={() => setTimeout(() => setIsHoverAdd(false), 500)}
          className="fixed right-16 bottom-6 z-50 flex origin-center items-center justify-center"
          transition={{ type: "keyframes", stiffness: 100, damping: 20 }}
        >
          <motion.div layout className={`rounded-full shadow-lg ${isHoverAdd ? "px-4" : "px-3"}`}>
            <Button
              color="primary"
              onPress={() => router.push(`${pathName}/create`)}
              className="text-primary-foreground bg-primary flex items-center gap-2 rounded-full text-sm font-medium"
            >
              <PlusIcon size={20} />
              <AnimatePresence>
                {isHoverAdd && (
                  <motion.span
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    Đăng bản tin
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </motion.div>
      )}

      {posts.length === 0 && (
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
