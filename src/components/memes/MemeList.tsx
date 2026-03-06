"use client";

import { Image, Input, Spinner } from "@heroui/react";
import React, { useEffect, useRef, useState } from "react";
import { SearchIcon } from "../svg";
import { KnotFoundEmptyIcon } from "../empty/empty";
import { Meme } from "@/interfaces/common";
import { STATUS_CODE } from "@/constants/enums";
import Masonry from "react-responsive-masonry";

export default function MemeList() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [memeList, setMemeList] = useState<Meme[]>([]);
  const [isLoadingMeme, setIsLoadingMeme] = useState<boolean>(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(
      () => {
        fetchMemes(searchInput);
      },
      searchInput.length ? 500 : 0
    );

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const fetchMemes = async (search: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoadingMeme(true);

    try {
      const res = await fetch(`/api/memes?search=${encodeURIComponent(search)}`, {
        signal: controller.signal,
      });

      const result = await res.json();

      if (result.status === STATUS_CODE.OK) {
        setMemeList(result.data);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setIsLoadingMeme(false);
    }
  };

  return (
    <div className="h-full min-h-96 w-full space-y-2 py-2 md:w-96">
      <Input
        placeholder="Tìm kiếm meme..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="sm"
        startContent={<SearchIcon size={16} />}
      />

      {isLoadingMeme ? (
        <div className="mt-16 flex w-full justify-center">
          <Spinner variant="gradient" color="default" />
        </div>
      ) : !memeList.length ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4">
          <KnotFoundEmptyIcon imageSize={50} />
          <p className="text-default-500">
            {searchInput.length ? "Không tìm thấy meme" : "Chưa có meme"}
          </p>
        </div>
      ) : (
        <div className="h-[30em] w-full overflow-y-auto px-2 py-2">
          <Masonry columnsCount={2} gutter="6px">
            {Array.from({ length: 3 })
              .fill(memeList)
              .flat()
              .map((meme: any, index) => (
                <div key={index}>
                  <Image src={meme.url} alt={meme.title || `meme${index}`} radius="sm" />
                </div>
              ))}
          </Masonry>
        </div>
      )}
    </div>
  );
}
