// components/ui/loaders/SmallTableSkeleton.tsx
"use client";

import React from "react";
import { Skeleton } from "@heroui/react";

type SmallTableSkeletonProps = {
  rows?: number;
  columns?: number;
  showTopContent?: boolean;
  className?: string;
};

export default function TableLoader({
  rows = 4,
  columns = 4,
  showTopContent = true,
  className = "",
}: SmallTableSkeletonProps) {
  const headerCols = Array.from({ length: columns });
  const bodyRows = Array.from({ length: rows });

  return (
    <div className={`border-default-200 w-full rounded-lg border p-4 ${className} overflow-hidden`}>
      {/* Top content (title / actions) */}
      {showTopContent && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-6 w-40 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      )}

      {/* Table header */}
      <div className="mb-3 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
        <div className="hidden grid-cols-12 items-center gap-4 md:grid">
          {headerCols.map((_, i) => (
            <div key={i} className={`col-span-${Math.max(1, Math.floor(12 / columns))}`}>
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
          ))}
        </div>

        {/* Mobile header row (stacked) */}
        <div className="flex gap-3 md:hidden">
          {headerCols.map((_, i) => (
            <Skeleton key={i} className="h-4 w-20 rounded-md" />
          ))}
        </div>
      </div>

      {/* Table body */}
      <div className="flex flex-col gap-3">
        {bodyRows.map((_, r) => (
          <div
            key={r}
            className="border-default-100 grid grid-cols-12 items-center gap-4 rounded-md border p-3"
          >
            {/* first col: avatar / thumbnail */}
            <div className="col-span-2">
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>

            {/* remaining cols: text */}
            <div className="col-span-10 grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>

              <div className="flex items-center justify-start gap-3">
                {Array.from({ length: Math.max(1, columns - 1) }).map((__, c) => (
                  <Skeleton key={c} className="h-3 w-24 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
