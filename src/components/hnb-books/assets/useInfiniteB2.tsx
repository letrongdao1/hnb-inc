import { DEFAULT_IMAGE_PAGE_SIZE } from "@/constants/constants";
import { UploadFile } from "@/interfaces/common";
import { FolderNode } from "@/lib/s3/folders";
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

  const loadMore = useCallback(async () => {
    if (done) return;

    if (!folder || (folder.children && folder.children.length > 0)) return;

    setIsLoadingFile(true);

    try {
      const params = new URLSearchParams();
      params.append("pageIndex", String(pageIndex));
      params.append("pageSize", String(pageSize));
      params.append("folder", folder.relativePath || "");

      const res = await fetch(`/api/upload/list?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();
      const newFiles = json.data ?? [];

      setFiles((prev) => [...prev, ...newFiles]);

      if (
        newFiles.length < pageSize ||
        (json.pagination?.total && files.length + newFiles.length >= json.pagination.total)
      ) {
        setDone(true);
      } else {
        setPageIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("loadMore error", err);
    } finally {
      setIsLoadingFile(false);
    }
  }, [folder, pageIndex, pageSize, done, files.length, setIsLoadingFile]);

  useEffect(() => {
    setFiles([]);
    setPageIndex(1);
    setDone(false);
  }, [folder]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const reload = async () => {
    setFiles([]);
    setPageIndex(1);
    setDone(false);
    await loadMore();
  };

  return { files, done, loaderRef, loadMore, reload };
}
