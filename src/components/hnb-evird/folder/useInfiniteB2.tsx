import { DEFAULT_IMAGE_PAGE_SIZE } from "@/constants/constants";
import { UploadFile } from "@/interfaces/common";
import { FolderNode } from "@/lib/s3/folders";
import { addToast } from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  folder?: FolderNode;
  pageSize?: number;
  setIsLoadingFile: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function useInfiniteB2({
  folder,
  pageSize = DEFAULT_IMAGE_PAGE_SIZE,
  setIsLoadingFile,
}: Props) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [done, setDone] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!folder || done || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingFile(true);

    try {
      const params = new URLSearchParams({
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
        folder: folder.relativePath || "",
      });

      const res = await fetch(`/api/upload/list?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Lỗi lấy file từ server");

      const json = await res.json();
      const newFiles: UploadFile[] = json.data ?? [];

      setFiles((prev) => [...prev, ...newFiles]);

      const reachedEnd =
        newFiles.length < pageSize ||
        (json.pagination?.total && json.pagination.total <= files.length + newFiles.length);

      if (reachedEnd) {
        setDone(true);
      } else {
        setPageIndex((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error("loadMore error", err);
      addToast({ title: String(err), color: "danger" });
    } finally {
      isLoadingRef.current = false;
      setIsLoadingFile(false);
    }
  }, [folder, pageIndex, pageSize, done, setIsLoadingFile, files.length]);

  useEffect(() => {
    setFiles([]);
    setPageIndex(1);
    setDone(false);
  }, [folder?.relativePath]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const reload = async () => {
    setFiles([]);
    setPageIndex(1);
    setDone(false);
    await loadMore();
  };

  return { files, done, loaderRef, loadMore, reload };
}
