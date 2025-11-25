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
  Avatar,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import FIRE_ICON from "@/assets/icons/fire-svgrepo-com.svg";
import {
  CheckIcon,
  DeleteIcon,
  EditIcon,
  EyeFilledIcon,
  ImageIcon,
  MoreIcon,
  PlusIcon,
} from "@/components/svg";
import { CommonUtils } from "@/utils/common.utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CreateUpdatePostForm from "@/components/management/hub/news/CreateUpdatePostForm";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import Countdown from "react-countdown";
import { useUser } from "@/providers/user.provider";
import ImagePreviewModal from "@/components/image-preview-modal";

export default function NewsManagement() {
  const { user } = useUser();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { loading, setLoading } = useLoading();

  const deleteModal = useDisclosure();
  const deleteLoading = useLoading();

  const activateNowModal = useDisclosure();
  const activateNowLoading = useLoading();

  const previewModal = useDisclosure();

  const [postList, setPostList] = useState<PostInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPost, setSelectedPost] = useState<PostInfo>();

  const actionMenuItems = [
    {
      key: "activate_now",
      label: "Đăng ngay bây giờ",
      icon: <CheckIcon size={16} />,
      onClick: (post: PostInfo) => {
        setSelectedPost(post);
        activateNowModal.onOpen();
      },
    },
    {
      key: "edit",
      label: "Cập nhật bản tin",
      icon: <EditIcon size={16} />,
      color: "primary",
      onClick: (post: PostInfo) => {
        setSelectedPost(post);
        router.push(`${pathName}?edit=true`);
      },
      disabled: false,
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteIcon size={16} />,
      color: "danger",
      onClick: (post: PostInfo) => {
        setSelectedPost(post);
        deleteModal.onOpen();
      },
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
          setSelectedPost(undefined);
        });
    },
    [setLoading]
  );

  useEffect(() => {
    fetchPostList();
  }, [fetchPostList]);

  const padTimeDisplay = (s: any) => {
    return s.toString().padStart(2, "0");
  };

  const getDateDetails = (date: string) => {
    const parsedDate = new Date(date);

    return {
      date: padTimeDisplay(parsedDate.getDate()),
      month: padTimeDisplay(parsedDate.getMonth() + 1),
      year: parsedDate.getFullYear(),
      weekDate: parsedDate.getDay(),
    };
  };

  const handleActivateNow = async (postId: string) => {
    activateNowLoading.setLoading(true);

    await fetch(`/api/posts/activate-now?postId=${postId}`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          fetchPostList();
          addToast({ title: result.message, color: "primary" });
        } else {
          addToast({ title: result.message, color: "danger" });
        }
      })
      .finally(() => {
        activateNowLoading.setLoading(false);
        activateNowModal.onClose();
      });
  };

  const handleDeletePost = async (postId: string) => {
    deleteLoading.setLoading(true);

    await fetch(`/api/posts?postId=${postId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          setPostList((prev) => prev.filter((post) => post.id !== postId));
          addToast({ title: result.message, color: "primary" });
        } else {
          addToast({ title: result.message, color: "danger" });
        }
      })
      .finally(() => {
        deleteLoading.setLoading(false);
        deleteModal.onClose();
      });
  };

  if (loading) return <Loader />;

  if (Boolean(searchParams.get("create")))
    return <CreateUpdatePostForm fetchPostList={fetchPostList} />;

  if (Boolean(searchParams.get("edit")) && selectedPost)
    return <CreateUpdatePostForm fetchPostList={fetchPostList} editedPost={selectedPost} />;

  return (
    <div className="flex w-full flex-col items-stretch justify-start gap-0.5 px-2">
      <div className="flex items-center justify-between gap-2 md:px-4">
        <p className="text-lg font-bold md:text-xl">
          Danh sách bản tin
          <span className="hidden text-xs font-light md:inline">
            &emsp;{postList.length ? `Tổng: ${postList.length} bản tin` : ""}
          </span>
        </p>

        <Button
          color="success"
          onPress={() => {
            router.push(`${pathName}?create=true`);
          }}
          startContent={<PlusIcon size={16} />}
        >
          <p className="hidden md:inline">Đăng bản tin</p>
        </Button>
      </div>
      {!postList.length ? (
        <EmptyComponent title={"Chưa có bản tin nào"} />
      ) : (
        postList.map((post, index) => {
          const isDateHidden =
            index > 0 && CommonUtils.compareDate(postList[index - 1].active_at, post.active_at);
          const isAvailable = new Date(post.active_at) < new Date(Date.now());
          return (
            <div
              key={post.id}
              className={`flex w-full items-start justify-start px-2 py-4 md:items-stretch`}
            >
              <Tooltip content={"Ngày bản tin được phát hành"}>
                <div className={`border-default-300 flex items-center gap-2 border-b px-2`}>
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
              </Tooltip>

              <div className="border-default-300 flex w-full flex-col items-stretch justify-around gap-4 border-b px-2 py-1 md:flex-row md:items-center">
                <div className="flex flex-3 items-center justify-start gap-2">
                  <p className="line-clamp-1 text-sm font-semibold wrap-anywhere">{post.title}</p>
                  <span className="hidden shrink-0 sm:inline">
                    <Tooltip content={"Tin hot"}>
                      {post.is_hot && (
                        <Image src={FIRE_ICON.src} alt="" className="aspect-square w-4" />
                      )}
                    </Tooltip>
                  </span>
                  <span className="shrink-0">
                    <Tooltip content={"Xem ảnh bìa"}>
                      {post.image && (
                        <div>
                          <Image
                            src={post.image}
                            alt={post.title}
                            width={32}
                            height={20}
                            radius="none"
                            onClick={() => previewModal.onOpen()}
                          />
                          <ImagePreviewModal
                            isOpen={previewModal.isOpen}
                            onOpenChange={previewModal.onOpenChange}
                            onClose={previewModal.onClose}
                            src={post.image}
                            alt={post.title}
                          />
                        </div>
                      )}
                    </Tooltip>
                  </span>
                </div>

                <div className="flex justify-evenly gap-2 md:ml-auto md:justify-end">
                  <span className={`flex items-center justify-start gap-2 md:flex-1`}>
                    {isAvailable ? (
                      <Tooltip content={"Bản tin đang được hiển thị trên bảng tin HNB."}>
                        <Chip size="sm" color="success" variant="shadow">
                          <CheckIcon size={16} />
                        </Chip>
                      </Tooltip>
                    ) : (
                      <Countdown
                        date={post.active_at}
                        renderer={({ days, hours, minutes, seconds, completed }) =>
                          completed ? (
                            <Tooltip content={"Bản tin đang được hiển thị trên bảng tin HNB."}>
                              <Chip size="sm" color="success" variant="shadow">
                                <CheckIcon size={16} />
                              </Chip>
                            </Tooltip>
                          ) : (
                            <Tooltip
                              content={"Thời gian còn lại để bản tin xuất hiện trên bảng tin HNB."}
                            >
                              <Chip
                                color="default"
                                variant="bordered"
                                className="text-xs font-light"
                              >
                                {days > 0
                                  ? `> ${days} ngày`
                                  : `${padTimeDisplay(hours)}:${padTimeDisplay(minutes)}:
                            ${padTimeDisplay(seconds)}`}
                              </Chip>
                            </Tooltip>
                          )
                        }
                      />
                    )}

                    <Popover>
                      <PopoverTrigger>
                        <button
                          disabled={!post.seenBy?.length}
                          className="text-default-900 bg-default-100 flex cursor-pointer items-center gap-2 rounded-full px-2 py-1"
                        >
                          <EyeFilledIcon />
                          <p className="text-sm">{post.seenBy ? post.seenBy.length : 0}</p>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="space-y-2 p-2">
                        <p className="font-light opacity-75">Danh sách người đã xem bài viết</p>
                        <div className="flex w-80 flex-wrap items-center justify-start gap-2">
                          {post.seenBy &&
                            post.seenBy.map((seen) => {
                              const seenUser = seen.user;
                              const isYou = user && user.id === seenUser.id;
                              return (
                                <Chip
                                  key={seenUser.id}
                                  avatar={<Avatar src={seenUser.avatar} alt="" />}
                                  variant="solid"
                                  color={isYou ? "primary" : "default"}
                                >
                                  {seenUser.display_name}
                                </Chip>
                              );
                            })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </span>

                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        variant="light"
                        startContent={<MoreIcon className="rotate-z-90" />}
                      />
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Hành động"
                      items={actionMenuItems}
                      disabledKeys={actionMenuItems
                        .filter((item) => item.disabled)
                        .map((item) => item.key)}
                    >
                      {(item) => (
                        <DropdownItem
                          key={item.key}
                          className={item.color && `text-${item.color}`}
                          color={(item.color as any) || "default"}
                          startContent={item.icon}
                          onClick={() => item.onClick?.(post)}
                          hidden={isAvailable && item.key === "activate_now"}
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

      {Boolean(postList.length) && (
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
      )}

      <ConfirmModal
        open={activateNowModal.isOpen}
        onOpenChange={activateNowModal.onOpenChange}
        onClose={activateNowModal.onClose}
        title="Xác nhận đăng bản tin ngay bây giờ"
        description="Bản tin sẽ xuất hiện trên bảng tin HNB sau khi xác nhận."
        onConfirm={() => {
          if (selectedPost) handleActivateNow(selectedPost.id);
        }}
        okButtonProps={{
          color: "primary",
        }}
        loading={activateNowLoading.loading}
      />

      <ConfirmModal
        open={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        onClose={deleteModal.onClose}
        title="Xác nhận xóa bản tin"
        extra="Thao tác này không thể được hoàn tác"
        onConfirm={() => {
          if (selectedPost) handleDeletePost(selectedPost.id);
        }}
        okButtonProps={{
          color: "danger",
        }}
        loading={deleteLoading.loading}
      />
    </div>
  );
}
