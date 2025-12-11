"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { NodeUtils } from "@/utils/node.utils";
import { useParams } from "next/navigation";
import MasonryItem from "./MasonryItem";
import { useDisclosure, addToast, Skeleton, Spinner } from "@heroui/react";
import { UploadFile } from "@/interfaces/common";
import { ResponsiveMasonry } from "react-responsive-masonry";
import EvirdFilePreviewModal from "./FilePreviewModal";
import EmptyComponent from "@/components/empty/empty";
import { FolderNode } from "@/lib/s3/folders";
import { DEFAULT_IMAGE_PAGE_SIZE } from "@/constants/constants";
import InfiniteScroll from "react-infinite-scroll-component";

const Masonry = dynamic(() => import("react-responsive-masonry"), { ssr: false });

type FileDisplayPageProps = { folderList: FolderNode[] };

const fileSizePerBatch = DEFAULT_IMAGE_PAGE_SIZE;

export default function FileDisplayPage({ folderList }: FileDisplayPageProps) {
  const { path } = useParams();
  const folder = NodeUtils.generateFolderNodeFromPath(Array.isArray(path) ? path.join("/") : "");

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [currentPreviewFile, setCurrentPreviewFile] = useState<UploadFile>();
  const previewModal = useDisclosure();

  const pageIndexRef = useRef(1);
  const doneRef = useRef(false);
  const loadingRef = useRef(false);

  const fetchFiles = useCallback(async () => {
    if (!folder || doneRef.current || loadingRef.current) return;

    loadingRef.current = true;

    const params = new URLSearchParams({
      pageIndex: String(pageIndexRef.current),
      pageSize: String(fileSizePerBatch),
      folder: folder.relativePath || "",
    });

    await fetch(`/api/upload/list?${params}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((result) => {
        const newFiles: UploadFile[] = result.data ?? [];
        const total = result.pagination?.total ?? 0;

        setFiles((prev) => {
          const merged = [...prev, ...newFiles];

          const reachedEnd = newFiles.length < fileSizePerBatch || merged.length >= total;

          if (reachedEnd) {
            doneRef.current = true;
          } else {
            pageIndexRef.current += 1;
          }

          return merged;
        });
      })
      .catch((err) => {
        console.error("fetchFiles error", err);
        addToast({
          title: "Lỗi lấy danh sách file. Vui lòng liên hệ phòng IT để xử lý!",
          color: "danger",
        });
      })
      .finally(() => {
        loadingRef.current = false;
      });
  }, [folder]);

  useEffect(() => {
    setFiles([]);
    doneRef.current = false;
    pageIndexRef.current = 1;

    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderList]);

  return (
    <div className="w-full pb-16">
      {!loadingRef.current && !files.length && <EmptyComponent margin={20} />}

      <InfiniteScroll
        next={fetchFiles}
        dataLength={files.length}
        hasMore={!doneRef.current}
        loader={
          <div className="flex w-full items-center justify-center pt-16 pb-8">
            <Spinner color="default" variant="simple" />
          </div>
        }
        style={{ overflowX: "hidden" }}
      >
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 2, 750: 3, 1080: 4 }}
          gutterBreakPoints={{ 350: "12px", 750: "10px", 900: "8px" }}
        >
          <Masonry>
            {files.length
              ? files.map((file) => (
                  <MasonryItem
                    key={file.id}
                    file={file}
                    onPreviewOpen={() => {
                      setCurrentPreviewFile(file);
                      previewModal.onOpen();
                    }}
                  />
                ))
              : null}
          </Masonry>
        </ResponsiveMasonry>
      </InfiniteScroll>

      <EvirdFilePreviewModal
        isOpen={previewModal.isOpen}
        onOpenChange={previewModal.onOpenChange}
        onClose={previewModal.onClose}
        file={currentPreviewFile}
      />
    </div>
  );
}
