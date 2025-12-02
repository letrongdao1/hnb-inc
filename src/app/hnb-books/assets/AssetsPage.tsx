"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import UploadAssetsModal from "@/components/hnb-books/assets/UploadModal";
import useInfiniteB2 from "@/components/hnb-books/assets/useInfiniteB2";
import { STATUS_CODE } from "@/constants/enums";
import { FolderNode } from "@/lib/s3/folders";
import { BreadcrumbItem, Breadcrumbs, Button, useDisclosure } from "@heroui/react";
import MasonryItem from "@/components/hnb-books/assets/MasonryItem";
import dynamic from "next/dynamic";

const Masonry = dynamic(() => import("react-responsive-masonry"), { ssr: false });
import { ResponsiveMasonry } from "react-responsive-masonry";
import MasonrySkeletonLoader from "@/components/hnb-books/assets/MasonrySkeletonLoader";
import { UploadIcon } from "@/components/svg";

export default function AssetsPage() {
  const uploadAssetsModal = useDisclosure();
  const { files, loaderRef, loading, done } = useInfiniteB2();

  const [folderList, setFolderList] = useState<FolderNode[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>("meme/test/1/2/3/4/5");

  const breadcrumbList = useMemo(() => currentFolder.split("/"), [currentFolder]);

  const fetchFolderList = useCallback(async () => {
    await fetch("/api/b2/folders")
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          setFolderList(result.data);
        }
      })
      .catch((err) => {
        console.log({ err });
      });
  }, []);

  useEffect(() => {
    fetchFolderList();
  }, [fetchFolderList]);

  const handleFolderNavigate = (index: number) => {
    if (index < 0) return;
    if (index === 0) return setCurrentFolder(breadcrumbList[0] || "");

    const toFolderArray = breadcrumbList.slice(0, index + 1);
    setCurrentFolder(toFolderArray.join("/"));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4">
      <div className="border-default-300 flex w-full flex-col items-center justify-between gap-2 rounded-md border px-4 py-2 md:flex-row md:py-4">
        <Breadcrumbs
          itemsAfterCollapse={2}
          itemsBeforeCollapse={3}
          maxItems={5}
          onAction={(key) => {
            handleFolderNavigate(Number(key));
          }}
        >
          {breadcrumbList.map((path, index) => (
            <BreadcrumbItem key={index}>{path}</BreadcrumbItem>
          ))}
        </Breadcrumbs>

        <Button onPress={() => uploadAssetsModal.onOpen()} startContent={<UploadIcon size={16} />}>
          Tải ảnh lên
        </Button>
      </div>

      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 2, 750: 3, 1080: 4 }}
        gutterBreakPoints={{ 350: "12px", 750: "16px", 900: "24px" }}
      >
        <Masonry>
          {files.map((file) => (
            <MasonryItem key={file.fileKey} file={file} />
          ))}
        </Masonry>
      </ResponsiveMasonry>

      <div ref={loaderRef} className="h-10" />

      <div className="py-6 text-center text-gray-400">{loading && <MasonrySkeletonLoader />}</div>

      <UploadAssetsModal
        isOpen={uploadAssetsModal.isOpen}
        onClose={uploadAssetsModal.onClose}
        onOpenChange={uploadAssetsModal.onOpenChange}
      />
    </div>
  );
}
