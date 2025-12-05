"use client";

import { FileIcon, FileUnknownIcon, VideoPlayIcon } from "@/components/svg";
import { UploadFile } from "@/interfaces/common";
import { FileTypeEnum, FileUtils } from "@/utils/file.utils";
import { Avatar, Image, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";

export default function MasonryItem({
  file,
  onPreviewOpen,
}: {
  file: UploadFile;
  onPreviewOpen: () => void;
}) {
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [contentByType, setContentByType] = useState<React.JSX.Element | null>(null);

  useEffect(() => {
    const load = async () => {
      switch (file.type) {
        case FileTypeEnum.IMAGE:
          setContentByType(
            <Image
              src={file.url}
              alt={file.title}
              radius="sm"
              loading="lazy"
              className="h-auto w-full object-cover"
            />
          );
          break;

        case FileTypeEnum.VIDEO: {
          setIsLoadingContent(true);
          const thumbnail = await FileUtils.generateVideoThumbnail(file.url);
          setContentByType(
            <div
              className="group relative h-32 w-full rounded-lg bg-cover bg-center bg-no-repeat md:h-48"
              style={{ backgroundImage: `url(${thumbnail})` }}
            >
              <span className="absolute inset-0 z-10 flex items-center justify-center text-white duration-200 group-hover:scale-110">
                <VideoPlayIcon size={40} />
              </span>
            </div>
          );
          setIsLoadingContent(false);
          break;
        }

        case FileTypeEnum.OTHER:
          setContentByType(
            <span className="border-default-300 flex h-24 w-full items-center justify-center rounded-md border md:h-40">
              <FileIcon size={40} />
            </span>
          );
          break;

        default:
          setContentByType(
            <span className="border-default-300 flex h-24 w-full items-center justify-center rounded-md border md:h-40">
              <FileUnknownIcon size={40} />
            </span>
          );
      }
    };

    load();
  }, [file]);

  return (
    <div className="group relative h-full w-full">
      {isLoadingContent ? (
        <div className="border-default-300 flex h-24 w-full items-center justify-center rounded-lg border md:h-40">
          <Spinner variant="simple" color="default" size="sm" />
        </div>
      ) : (
        <div onClick={onPreviewOpen} className="h-auto w-full cursor-pointer">
          {contentByType}
        </div>
      )}

      <div className="absolute bottom-0 left-0 z-10 truncate rounded-tr-md rounded-bl-md bg-white/70 p-2 text-xs text-black opacity-0 duration-200 group-hover:opacity-100 dark:bg-black/50 dark:text-white">
        {file.url.split("/").pop() || "unidentified"}
      </div>
    </div>
  );
}
