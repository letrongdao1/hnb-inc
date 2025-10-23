"use client";

import HoverableUser from "@/components/hoverable-user/hoverable-user";
import { motion } from "framer-motion";
import { PostInfo } from "@/interfaces/news";
import { Card, CardBody, CardFooter, CardHeader, Divider, Image } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";

export default function SinglePost({ post, isFirst }: { post: PostInfo; isFirst?: boolean }) {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onClick={() => router.push(`${pathName}/${post.slug}`)}
      className={`w-full ${isFirst ? "col-span-full" : ""}`}
    >
      <Card
        isBlurred
        shadow="md"
        className={`group border-default-100 bg-background/60 h-full cursor-pointer overflow-hidden border backdrop-blur-md transition-all duration-300 ${
          isFirst
            ? "hover:scale-[1.02] hover:shadow-2xl md:flex md:flex-row"
            : "hover:scale-[1.02] hover:shadow-lg"
        }`}
      >
        {/* Image section */}
        <CardHeader
          className={`relative overflow-hidden p-0 ${isFirst ? "h-72 md:h-auto md:w-1/2" : "h-64"}`}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full"
          >
            {post.image ? (
              <Image
                removeWrapper
                src={post.image}
                alt={post.title}
                className={`h-full w-full rounded-none object-cover ${
                  isFirst ? "md:rounded-r-lg" : "rounded-t-lg"
                }`}
              />
            ) : (
              <div className="font-title flex h-full w-full items-center justify-center text-[3em] font-black tracking-wider">
                H N B
              </div>
            )}
          </motion.div>
        </CardHeader>

        {/* Content section */}
        <CardBody className={`flex flex-col justify-center p-6 ${isFirst ? "md:w-1/2" : ""}`}>
          <h1
            className={`text-foreground mb-3 line-clamp-3 font-bold group-hover:underline ${
              isFirst ? "text-4xl leading-tight md:text-5xl" : "text-2xl"
            }`}
          >
            {post.title}
          </h1>

          <Divider className="my-2" />

          {post.content && (
            <div
              className={`text-default-600 line-clamp-3 ${
                isFirst ? "text-lg md:line-clamp-4" : "text-sm"
              }`}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
        </CardBody>

        {/* Footer */}
        {!isFirst && (
          <CardFooter className="text-default-400 flex justify-end px-6 py-4 text-xs">
            <div className="text-default-400 mb-4 ml-auto flex items-center gap-2 text-xs">
              <p className="hidden items-center gap-2 sm:flex">
                Đăng bởi <HoverableUser user={post.user} />
              </p>
              <p className="hidden sm:inline">•</p>
              <time dateTime={post.active_at}>
                {new Date(post.active_at).toLocaleDateString("vi", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.article>
  );
}
