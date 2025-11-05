"use client";

import { Skeleton } from "@heroui/react";

export default function DetailPageLoader() {
  return (
    <div className="w-full flex flex-col gap-8 p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/3 rounded-lg" />
      </div>

      <Skeleton className="h-64 w-full rounded-xl" />

      <div className="flex flex-wrap gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-32 rounded-lg" />
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-11/12 rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Skeleton className="h-6 w-56 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
