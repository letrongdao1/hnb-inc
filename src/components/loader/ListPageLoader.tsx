"use client";

import { Skeleton } from "@heroui/react";

export default function ListPageLoader() {
  return (
    <div className="flex w-full flex-col gap-8 p-6 xl:max-w-2/3">
      <div className="flex flex-col items-center justify-center gap-2">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>

      <div className="flex flex-col gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-default-200 flex flex-col gap-3 rounded-xl border p-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
