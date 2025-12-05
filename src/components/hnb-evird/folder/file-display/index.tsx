"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import useInfiniteB2 from "../useInfiniteB2";
import { NodeUtils } from "@/utils/node.utils";
import { useParams } from "next/navigation";
import MasonryItem from "./MasonryItem";
import { useDisclosure } from "@heroui/react";
import { UploadFile } from "@/interfaces/common";
import MasonrySkeletonLoader from "./MasonrySkeletonLoader";
import { ResponsiveMasonry } from "react-responsive-masonry";
import EvirdFilePreviewModal from "./FilePreviewModal";
import EmptyComponent from "@/components/empty/empty";

const Masonry = dynamic(() => import("react-responsive-masonry"), { ssr: false });

export default function FileDisplayPage() {
  const { path } = useParams();

  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState<UploadFile>();

  const previewModal = useDisclosure();

  const { files, loaderRef } = useInfiniteB2({
    folder: NodeUtils.generateFolderNodeFromPath(Array.isArray(path) ? path.join("/") : ""),
    setIsLoadingFile: setIsLoadingFile,
  });

  return (
    <div className="w-full">
      {!isLoadingFile && !files.length && <EmptyComponent margin={20} />}

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

      {isLoadingFile && <MasonrySkeletonLoader />}

      <div ref={loaderRef} className="h-10" />

      <EvirdFilePreviewModal
        isOpen={previewModal.isOpen}
        onOpenChange={previewModal.onOpenChange}
        onClose={previewModal.onClose}
        file={currentPreviewFile}
      />
    </div>
  );
}
