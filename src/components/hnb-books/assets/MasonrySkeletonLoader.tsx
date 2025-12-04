"use client";

import { Skeleton } from "@heroui/react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

interface FilesSkeletonProps {
  count?: number;
}

export default function MasonrySkeletonLoader({ count = 12 }: FilesSkeletonProps) {
  const placeholders = Array.from({ length: count });

  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1440: 4 }}
      gutterBreakPoints={{ 350: "12px", 750: "16px", 900: "24px" }}
    >
      <Masonry>
        {placeholders.map((_, idx) => {
          const height = 120 + Math.floor(Math.random() * 100);
          return (
            <div key={idx} className="w-full">
              <Skeleton
                className="dark:bg-default-200 bg-default-200 w-full rounded-lg"
                style={{ height }}
              />
            </div>
          );
        })}
      </Masonry>
    </ResponsiveMasonry>
  );
}
