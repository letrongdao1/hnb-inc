"use client";

import React, { useMemo, useState } from "react";
import { FolderNode } from "@/lib/s3/folders";
import { FolderIcon } from "@/components/svg";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";
import FileDisplayPage from "./file-display";
import EmptyComponent from "@/components/empty/empty";

type AssetsPageProps = {
  folderList: FolderNode[];
};
export default function EvirdFolderContentPage({ folderList }: AssetsPageProps) {
  const router = useRouter();
  const pathName = usePathname();

  const [hoveredFolder, setHoveredFolder] = useState<string>("");
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>("");

  const isFolderSelected = useMemo(() => {
    const parts = pathName.split("/");
    const defaultParts = "/hnb-evird/folder".split("/");

    return parts.some((part) => !!part && !defaultParts.includes(part));
  }, [pathName]);

  if (!folderList.length) {
    if (isFolderSelected) {
      return <FileDisplayPage folderList={folderList} />;
    }

    return <EmptyComponent title={"Chưa có thư mục"} />;
  }

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      {folderList.map((folder) => {
        const isHovered = folder.path === hoveredFolder;
        const isNavigating = selectedFolderPath === folder.path;
        return (
          <button
            key={folder.path}
            onClick={() => {
              if (isHovered) {
                setSelectedFolderPath(folder.path || "");
                router.push(`${pathName}/${folder.label}`);
              } else {
                setHoveredFolder(folder.path);
              }
            }}
            onBlur={() => setHoveredFolder("")}
            className={`${isNavigating && "opacity-50"} border-default-300 flex cursor-pointer items-center gap-2 rounded-md border p-4 duration-200 focus:font-semibold focus:ring-2`}
          >
            {isNavigating ? (
              <Spinner color="default" variant="simple" size="sm" />
            ) : (
              <FolderIcon size={16} />
            )}
            <p className="text-sm">{folder.label}</p>
          </button>
        );
      })}
    </div>
  );
}
