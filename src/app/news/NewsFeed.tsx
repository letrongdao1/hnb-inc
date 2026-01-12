"use client";

import React, { useCallback, useState } from "react";
import { PostResponse } from "./page";
import SinglePost from "./SinglePost";
import { PageTitle } from "@/components/ui/text";
import EmptyComponent from "@/components/empty/empty";
import { motion } from "framer-motion";
import { addToast, Button } from "@heroui/react";
import { DEFAULT_PAGE_SIZE } from "@/constants/constants";
import { STATUS_CODE } from "@/constants/enums";
import { useLoading } from "@/hooks/useLoading";
import { LoaderIcon } from "@/components/loader";

export default function NewsFeed({ posts, count }: { posts: PostResponse; count: number }) {
  const [currentPostList, setCurrentPostList] = useState<PostResponse>(posts);
  const [pageIndex, setPageIndex] = useState<number>(1);

  const { loading, setLoading } = useLoading();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    await fetch(`/api/posts?pageIndex=${pageIndex + 1}&pageSize=${DEFAULT_PAGE_SIZE}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          setCurrentPostList((prev) => [...prev, ...result.data]);
          setPageIndex((prev) => prev + 1);
        }
      })
      .catch(() => {
        addToast({ title: "Lỗi lấy thêm danh sách bản tin", color: "danger" });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageIndex, setLoading]);

  return (
    <div className="relative flex w-full flex-col items-stretch gap-4 pb-20 xl:max-w-[60em]">
      <PageTitle>Bảng tin HNB</PageTitle>

      {!currentPostList.length && (
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
        {currentPostList.map((post, index) => (
          <SinglePost key={post.id} post={post} isFirst={index === 0} />
        ))}
      </motion.section>

      {currentPostList.length < count ? (
        loading ? (
          <div className="flex w-full justify-center py-2">
            <LoaderIcon />
          </div>
        ) : (
          <Button fullWidth size="sm" variant="ghost" color="default" onPress={fetchPosts}>
            Hiện thêm bản tin
          </Button>
        )
      ) : null}
    </div>
  );
}
