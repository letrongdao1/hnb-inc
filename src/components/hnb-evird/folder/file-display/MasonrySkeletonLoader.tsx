"use client";

import { Skeleton } from "@heroui/react";
import dynamic from "next/dynamic";
import { ResponsiveMasonry } from "react-responsive-masonry";

const Masonry = dynamic(() => import("react-responsive-masonry"), { ssr: false });

interface FilesSkeletonProps {
  count?: number;
}

export default function MasonrySkeletonLoader({ count = 12 }: FilesSkeletonProps) {
  const placeholders = Array.from({ length: count });

  return (
    <div className="py-6 text-center text-gray-400">
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1440: 4 }}
        gutterBreakPoints={{ 350: "12px", 750: "16px", 900: "24px" }}
      >
        <Masonry>
          {placeholders.map((_, idx) => {
            const height = 120 + Math.floor(Math.random() * 100);
            return (
              <div key={idx} className="w-full">
                <Skeleton className="bg-default-100 w-full rounded-lg" style={{ height }} />
              </div>
            );
          })}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}
