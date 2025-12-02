"use client";

import { Image } from "@heroui/react";

export default function MasonryItem({ file }: { file: any }) {
  return (
    <div className="group relative h-full w-full">
      <Image
        src={file.url}
        loading="lazy"
        alt={file.fileName}
        className="h-auto w-full object-cover"
      />

      <div className="absolute bottom-0 left-0 z-10 truncate rounded-tr-md rounded-bl-md bg-white/70 p-2 text-xs text-black opacity-0 duration-200 group-hover:opacity-100 dark:bg-black/50 dark:text-white">
        {file.fileName}
      </div>
    </div>
  );
}
