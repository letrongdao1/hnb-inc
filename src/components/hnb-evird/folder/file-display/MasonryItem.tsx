"use client";

import { FileIcon, FileUnknownIcon, VideoPlayIcon } from "@/components/svg";
import { UploadFile } from "@/interfaces/common";
import { FileTypeEnum, FileUtils } from "@/utils/file.utils";
import { useEffect, useState } from "react";
import BlurHashImage from "./BlurHashImage";
import { Spinner } from "@heroui/react";

export default function MasonryItem({
  file,
  onPreviewOpen,
}: {
  file: UploadFile;
  onPreviewOpen: () => void;
}) {
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [contentByType, setContentByType] = useState<React.JSX.Element | null>(null);

  const fileFullName = file.url.split("/").pop();
  const fileName = fileFullName?.split(".").at(0);
  const fileExt = fileFullName?.split(".").at(-1);

  useEffect(() => {
    const load = async () => {
      switch (file.type) {
        case FileTypeEnum.IMAGE:
          setContentByType(
            <BlurHashImage src={file.url} alt={file.title || ""} blurHash={file.blurHash} />
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
              <div className="absolute inset-0 z-10 bg-black/30" />
              <span className="absolute inset-0 z-20 flex items-center justify-center text-white duration-200 group-hover:shadow-2xl">
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
    <div onClick={onPreviewOpen} className="group relative h-full w-full overflow-x-hidden">
      {isLoadingContent ? (
        <div className="border-default-300 flex h-24 w-full items-center justify-center rounded-lg border md:h-40">
          <Spinner color="default" variant="gradient" size="sm" />
        </div>
      ) : (
        contentByType
      )}

      <div className="absolute bottom-0 left-0 z-10 flex max-w-full items-center rounded-bl-md bg-white/70 p-2 text-xs text-black opacity-0 duration-200 group-hover:opacity-100 dark:bg-black/50 dark:text-white">
        <span className="min-w-0 truncate">{fileName}</span>
        <span className="shrink-0">{"." + fileExt}</span>
      </div>
    </div>
  );
}
