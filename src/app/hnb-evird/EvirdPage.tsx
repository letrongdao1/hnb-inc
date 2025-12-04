"use client";

import React, { useEffect, useState } from "react";
import { FolderNode } from "@/lib/s3/folders";
import { BreadcrumbItem, Breadcrumbs, Button, useDisclosure } from "@heroui/react";
import MasonryItem from "@/components/hnb-books/assets/MasonryItem";
import dynamic from "next/dynamic";
import { ResponsiveMasonry } from "react-responsive-masonry";
import useInfiniteB2 from "@/components/hnb-books/assets/useInfiniteB2";
import UploadAssetsModal from "@/components/hnb-books/assets/upload-modal";
import MasonrySkeletonLoader from "@/components/hnb-books/assets/MasonrySkeletonLoader";
import { FolderIcon, HomeIcon, UploadIcon } from "@/components/svg";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyComponent from "@/components/empty/empty";
import { NodeUtils } from "@/utils/node.utils";
import { UploadFile } from "@/interfaces/common";
import EvirdFilePreviewModal from "@/components/hnb-books/assets/FilePreviewModal";

const Masonry = dynamic(() => import("react-responsive-masonry"), { ssr: false });

type AssetsPageProps = {
  folderList: FolderNode[];
};
export default function EvirdPage({ folderList: initialAllFolderList }: AssetsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allFolderList, setAllFolderList] = useState<FolderNode[]>(initialAllFolderList);
  const [currentFolderList, setCurrentFolderList] = useState<FolderNode[]>(initialAllFolderList);
  const [currentFolderOpenTree, setCurrentFolderOpenTree] = useState<FolderNode[]>([]);
  const [hoveredFolder, setHoveredFolder] = useState<string>("");
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState<UploadFile>();

  const uploadAssetsModal = useDisclosure();
  const previewModal = useDisclosure();

  const { files, loaderRef, reload, done } = useInfiniteB2({
    folder: currentFolderOpenTree[currentFolderOpenTree.length - 1],
    setIsLoadingFile: setIsLoadingFile,
  });

  useEffect(() => {
    if (!currentFolderOpenTree.length) {
      setCurrentFolderList(allFolderList);
      return;
    }

    setCurrentFolderList(() => {
      const currentFolderNode = allFolderList.find(
        (node) =>
          currentFolderOpenTree[currentFolderOpenTree.length - 1].relativePath === node.relativePath
      );

      if (!currentFolderNode) return [];
      else return currentFolderNode.children ?? [];
    });
  }, [allFolderList, currentFolderOpenTree]);

  useEffect(() => {
    if (!currentFolderOpenTree.length) return;

    setCurrentFolderList(currentFolderOpenTree[currentFolderOpenTree.length - 1]?.children || []);
  }, [currentFolderOpenTree]);

  useEffect(() => {
    const urlPath = searchParams.get("path");

    if (!urlPath) {
      setCurrentFolderOpenTree([]);
      setCurrentFolderList(allFolderList);
      return;
    }

    const chain = NodeUtils.findNodeChain(allFolderList, urlPath);
    setCurrentFolderOpenTree(chain);

    const lastNode = chain[chain.length - 1];
    setCurrentFolderList(lastNode?.children ?? []);
  }, [searchParams, allFolderList]);

  const handleFolderNavigateOnBreadcrumbs = (relativePath: string) => {
    if (!Boolean(relativePath) || relativePath === "/") {
      setCurrentFolderOpenTree([]);
      setCurrentFolderList(allFolderList);
      return;
    }

    const chain = NodeUtils.findNodeChain(allFolderList, relativePath);
    setCurrentFolderOpenTree(chain);

    const lastNode = chain[chain.length - 1];
    setCurrentFolderList(lastNode?.children ?? []);

    router.replace(relativePath === "/" ? "" : `?path=${relativePath}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4">
      <Breadcrumbs
        itemsAfterCollapse={2}
        itemsBeforeCollapse={3}
        maxItems={5}
        onAction={(key) => {
          handleFolderNavigateOnBreadcrumbs(String(key));
        }}
      >
        {currentFolderOpenTree.length > 0 && (
          <BreadcrumbItem key={"/"}>
            <HomeIcon size={16} />
          </BreadcrumbItem>
        )}
        {currentFolderOpenTree.map((folder) => (
          <BreadcrumbItem key={folder.relativePath}>{folder.label}</BreadcrumbItem>
        ))}
      </Breadcrumbs>

      <div className="border-default-300 flex w-full flex-col items-center justify-between gap-2 rounded-md border-b px-4 py-2 md:flex-row md:py-4">
        <div className="flex items-stretch justify-start gap-2"></div>

        <Button
          color="default"
          variant="faded"
          onPress={() => uploadAssetsModal.onOpen()}
          startContent={<UploadIcon size={16} />}
        >
          Tải file lên cloud
        </Button>
      </div>

      {!currentFolderList.length && !files.length && !isLoadingFile ? (
        <div className="md:mt-[10vh]">
          <EmptyComponent />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {currentFolderList.map((folder) => {
              const isHovered = folder.path === hoveredFolder;
              return (
                <span
                  key={folder.path}
                  onClick={() => {
                    if (isHovered) {
                      setCurrentFolderOpenTree((prev) => [...prev, folder]);
                      router.replace(folder.relativePath ? `?path=${folder.relativePath}` : "");
                      setHoveredFolder("");
                    } else {
                      setHoveredFolder(folder.path);
                    }
                  }}
                  className={`${isHovered ? "font-semibold ring-2" : "hover:opacity-75"} border-default-300 flex cursor-pointer items-center gap-2 rounded-md border p-4 duration-200`}
                >
                  <FolderIcon size={16} />
                  <p className="text-sm">{folder.label}</p>
                </span>
              );
            })}
          </div>

          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 2, 750: 3, 1080: 4 }}
            gutterBreakPoints={{ 350: "12px", 750: "16px", 900: "24px" }}
          >
            <Masonry>
              {files.map((file) => (
                <MasonryItem
                  key={file.id}
                  file={file}
                  onPreviewOpen={() => {
                    setCurrentPreviewFile(file);
                    previewModal.onOpen();
                  }}
                />
              ))}
            </Masonry>
          </ResponsiveMasonry>

          <div className="py-6 text-center text-gray-400">
            {isLoadingFile && <MasonrySkeletonLoader />}
          </div>
        </>
      )}

      <div ref={loaderRef} className="h-10" />

      <UploadAssetsModal
        isOpen={uploadAssetsModal.isOpen}
        onClose={uploadAssetsModal.onClose}
        onOpenChange={uploadAssetsModal.onOpenChange}
        handleInsertNewFolder={(newRelativePath: string) => {
          setAllFolderList((prev) => NodeUtils.insertFolderNode(prev, newRelativePath));
        }}
      />

      <EvirdFilePreviewModal
        isOpen={previewModal.isOpen}
        onOpenChange={previewModal.onOpenChange}
        onClose={previewModal.onClose}
        file={currentPreviewFile}
      />
    </div>
  );
}
