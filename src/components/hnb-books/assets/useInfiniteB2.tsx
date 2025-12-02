import { DEFAULT_IMAGE_PAGE_SIZE } from "@/constants/constants";
import { useCallback, useEffect, useRef, useState } from "react";

export default function useInfiniteB2(folder?: string, pageSize = DEFAULT_IMAGE_PAGE_SIZE) {
  const [files, setFiles] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("pageIndex", String(pageIndex));
      params.append("pageSize", String(pageSize));
      if (folder) params.append("folder", folder);

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
      setLoading(false);
    }
  }, [folder, pageIndex, pageSize, loading, done, files.length]);

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

  return { files, loading, done, loaderRef, loadMore };
}
