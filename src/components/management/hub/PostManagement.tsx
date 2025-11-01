"use client";

import React, { useCallback, useEffect, useState } from "react";
import EmptyComponent from "@/components/empty/empty";
import Loader from "@/components/loader";
import { DEFAULT_PAGE_SIZE, VIETNAMESE_WEEK_DAYS } from "@/constants/constants";
import { STATUS_CODE } from "@/constants/enums";
import { useLoading } from "@/hooks/useLoading";
import { PostInfo } from "@/interfaces/news";
import {
  addToast,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Pagination,
  Tooltip,
} from "@heroui/react";
import FIRE_ICON from "@/assets/icons/fire-svgrepo-com.svg";
import { DeleteIcon, EditIcon, ImageIcon, MoreIcon } from "@/components/svg";
import { CommonUtils } from "@/utils/common.utils";

export default function PostManagement() {
  const { loading, setLoading } = useLoading();

  const [postList, setPostList] = useState<PostInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const actionMenuItems = [
    {
      key: "edit",
      label: "Sửa bản tin",
      icon: <EditIcon size={16} />,
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteIcon size={16} />,
      danger: true,
    },
  ];

  const fetchPostList = useCallback(
    async (pageIndex?: number) => {
      setLoading(true);

      await fetch(`/api/posts?pageIndex=${pageIndex || 1}&pageSize=${DEFAULT_PAGE_SIZE}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            setPostList(result.data || []);
            setTotal(result.count || 0);
          }
        })
        .catch(() => {
          addToast({
            title: "Lỗi lấy danh sách bản tin!",
            color: "danger",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [setLoading]
  );

  useEffect(() => {
    fetchPostList();
  }, [fetchPostList]);

  const getDateDetails = (date: string) => {
    const parsedDate = new Date(date);

    return {
      date: parsedDate.getDate().toString().padStart(2, "0"),
      month: (parsedDate.getMonth() + 1).toString().padStart(2, "0"),
      year: parsedDate.getFullYear(),
      weekDate: parsedDate.getDay(),
    };
  };

  if (loading) return <Loader />;

  return (
    <div className="flex w-full flex-col items-stretch justify-start gap-0.5 px-2">
      {!postList.length ? (
        <EmptyComponent title={"Không có bản tin nào"} />
      ) : (
        postList.map((post, index) => {
          const isDateHidden =
            index > 0 && CommonUtils.compareDate(postList[index - 1].active_at, post.active_at);
          return (
            <div key={post.id} className={`flex w-full items-stretch justify-start px-2 py-4`}>
              <div
                className={`border-default-300 flex items-center gap-2 border-b px-2 ${isDateHidden && "invisible"}`}
              >
                <p className="w-full text-xl font-semibold">
                  {getDateDetails(post.active_at).date}
                </p>
                <div className="text-tiny flex items-center text-nowrap">
                  {getDateDetails(post.active_at).month}
                  <span className="hidden lg:inline">
                    ,&ensp;{VIETNAMESE_WEEK_DAYS[getDateDetails(post.active_at).weekDate]}
                  </span>
                </div>
              </div>

              <div className="border-default-300 flex w-full items-center justify-around gap-4 border-b px-2 py-1">
                <div className="flex flex-3 items-center justify-start gap-2">
                  <p className="line-clamp-1 text-sm font-semibold">{post.title}</p>
                  <span className="shrink-0">
                    <Tooltip content={"Có ảnh bìa"}>
                      {post.image && <ImageIcon size={16} className="text-sky-600" />}
                    </Tooltip>
                  </span>
                </div>

                <span className={`flex flex-1 justify-center ${!post.is_hot && "invisible"}`}>
                  <Chip
                    size="sm"
                    color="danger"
                    startContent={
                      <Image src={FIRE_ICON.src} alt="" className="aspect-square w-8" />
                    }
                  >
                    <p className="hidden md:inline">HOT</p>
                  </Chip>
                </span>

                <div className="ml-auto flex justify-end">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        variant="light"
                        startContent={<MoreIcon className="rotate-z-90" />}
                      />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Hành động" items={actionMenuItems}>
                      {(item) => (
                        <DropdownItem
                          key={item.key}
                          className={item.danger ? "text-danger" : ""}
                          color={item.danger ? "danger" : "default"}
                          startContent={item.icon}
                        >
                          {item.label}
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
          );
        })
      )}

      <Pagination
        isCompact
        showControls
        total={Math.ceil(total / DEFAULT_PAGE_SIZE)}
        initialPage={1}
        page={currentPage}
        onChange={(page) => {
          setCurrentPage(page);
          fetchPostList(page);
        }}
        className="mx-auto mt-4"
      />
    </div>
  );
}
