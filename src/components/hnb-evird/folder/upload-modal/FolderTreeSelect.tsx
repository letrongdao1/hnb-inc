"use client";

import React, { useState } from "react";
import { ChevronRightIcon, ChevronDownIcon, ArrowLeftIcon } from "@heroui/shared-icons";
import { FolderContainerIcon, FolderReceiveIcon } from "@/components/svg";
import { FolderNode } from "@/lib/s3/folders";
import { Skeleton } from "@heroui/react";

const INDENT = 16;

type FolderTreeSelectProps = {
  folderTree: FolderNode[];
  selectedFolder: string;
  setSelectedFolder: React.Dispatch<React.SetStateAction<string>>;
  openMap: Record<string, boolean>;
  toggleOpenMap: (path: string) => void;
};

export default function FolderTreeSelect({
  folderTree,
  selectedFolder,
  setSelectedFolder,
  openMap,
  toggleOpenMap,
}: FolderTreeSelectProps) {
  const render = (nodes: FolderNode[], level: number) => {
    const sortedNodes = nodes.sort((a, b) => {
      const aHasChildren = !!a.children?.length;
      const bHasChildren = !!b.children?.length;

      return Number(bHasChildren) - Number(aHasChildren);
    });

    return sortedNodes.map((node) => {
      const hasChildren = !!node.children?.length;
      const isOpen = openMap[node.path];
      const isSelected = selectedFolder === node.path;

      return (
        <div key={node.path}>
          <div
            className={`relative flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm duration-200 ${isSelected ? "bg-default-200 text-success-500 font-semibold" : "hover:bg-default-100"}`}
            style={{ paddingLeft: level * INDENT + 8 }}
            onClick={() => {
              if (hasChildren) {
                toggleOpenMap(node.path);
              } else {
                if (isSelected) setSelectedFolder("");
                else setSelectedFolder(node.path);
              }
            }}
          >
            {hasChildren ? (
              isOpen ? (
                <ChevronDownIcon className="text-default-500 h-4 w-4" />
              ) : (
                <ChevronRightIcon className="text-default-500 h-4 w-4" />
              )
            ) : (
              <span className="w-4" />
            )}

            {node.children?.length ? (
              <FolderContainerIcon className={`text-default-400 h-4 w-4`} />
            ) : (
              <FolderReceiveIcon
                className={`${isSelected ? "text-success-500" : "text-default-400"} h-4 w-4`}
              />
            )}
            <span className={`truncate ${hasChildren ? "font-semibold" : ""}`}>{node.label}</span>

            {isSelected && (
              <span className="absolute top-1/2 right-2 -translate-y-1/2">
                <ArrowLeftIcon className="text-success-500 h-4 w-4" />
              </span>
            )}
          </div>

          {hasChildren && isOpen && <div>{render(node.children!, level + 1)}</div>}
        </div>
      );
    });
  };

  return (
    <div className="max-h-[30vh] w-full overflow-y-auto select-none md:max-h-full">
      {render(folderTree, 0)}
    </div>
  );
}

export const FolderTreeSkeleton = () => {
  const rows = [
    { level: 0, width: "w-32" },
    { level: 1, width: "w-40" },
    { level: 2, width: "w-28" },
    { level: 1, width: "w-36" },
    { level: 0, width: "w-44" },
    { level: 1, width: "w-30" },
  ];

  return (
    <div className="w-full">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-2 py-1"
          style={{ paddingLeft: row.level * INDENT + 8 }}
        >
          <Skeleton className={`h-4 ${row.width} rounded-md`} />
        </div>
      ))}
    </div>
  );
};
