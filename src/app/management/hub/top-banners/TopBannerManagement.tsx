"use client";

import React, { useCallback, useEffect, useState } from "react";
import EmptyComponent from "@/components/empty/empty";
import Loader from "@/components/loader";
import { DEFAULT_PAGE_SIZE, VIETNAMESE_WEEK_DAYS } from "@/constants/constants";
import { STATUS_CODE } from "@/constants/enums";
import { useLoading } from "@/hooks/useLoading";
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
  useDisclosure,
} from "@heroui/react";
import {
  CheckIcon,
  DeleteIcon,
  EditIcon,
  EyeSlashFilledIcon,
  MoreIcon,
  PlusIcon,
} from "@/components/svg";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import Countdown from "react-countdown";
import { useUser } from "@/providers/user.provider";
import { TopBanner } from "@/interfaces/common";
import CreateUpdateTopBannerForm from "@/components/management/hub/top-banners/CreateUpdateTopBannerForm";
import ImagePreviewModal from "@/components/ui/preview-modal";

export default function TopBannerManagement() {
  const { user } = useUser();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { loading, setLoading } = useLoading();

  const deleteLoading = useLoading();
  const deleteModal = useDisclosure();

  const updateStatusLoading = useLoading();
  const activateConfirmModal = useDisclosure();
  const deactivateConfirmModal = useDisclosure();

  const previewModal = useDisclosure();

  const [topBannerList, setTopBannerList] = useState<TopBanner[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedBanner, setSelectedBanner] = useState<TopBanner>();

  const actionMenuItems = [
    {
      key: "activate",
      label: "Hiển thị",
      icon: <CheckIcon size={16} />,
      color: "success",
      onClick: (banner: TopBanner) => {
        setSelectedBanner(banner);
        activateConfirmModal.onOpen();
      },
      disabled: false,
    },
    {
      key: "deactivate",
      label: "Ngừng hiển thị",
      icon: <CheckIcon size={16} />,
      color: "warning",
      onClick: (banner: TopBanner) => {
        setSelectedBanner(banner);
        deactivateConfirmModal.onOpen();
      },
      disabled: false,
    },
    {
      key: "edit",
      label: "Cập nhật banner",
      icon: <EditIcon size={16} />,
      color: "primary",
      onClick: (banner: TopBanner) => {
        setSelectedBanner(banner);
        router.push(`${pathName}?edit=true`);
      },
      disabled: false,
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteIcon size={16} />,
      color: "danger",
      onClick: (banner: TopBanner) => {
        setSelectedBanner(banner);
        deleteModal.onOpen();
      },
    },
  ];

  const fetchBannerList = useCallback(
    async (pageIndex?: number) => {
      setLoading(true);

      await fetch(`/api/top-banners/all?pageIndex=${pageIndex || 1}&pageSize=${DEFAULT_PAGE_SIZE}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            setTopBannerList(result.data || []);
            setTotal(result.count || 0);
          }
        })
        .catch(() => {
          addToast({
            title: "Lỗi lấy danh sách banner!",
            color: "danger",
          });
        })
        .finally(() => {
          setLoading(false);
          setSelectedBanner(undefined);
        });
    },
    [setLoading]
  );

  useEffect(() => {
    fetchBannerList();
  }, [fetchBannerList]);

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

  const handleUpdateBannerStatus = async (bannerId: number, status: boolean) => {
    updateStatusLoading.setLoading(true);

    await fetch(
      `/api/top-banners/activate?bannerId=${bannerId}&status=${status ? "true" : "false"}`,
      {
        method: "PATCH",
      }
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          addToast({ title: result.message, color: "primary" });
          fetchBannerList();
        } else {
          addToast({ title: result.message, color: "danger" });
        }
      })
      .finally(() => {
        updateStatusLoading.setLoading(false);
        activateConfirmModal.onClose();
        deactivateConfirmModal.onClose();
      });
  };

  const handleDeleteBanner = async (bannerId: number) => {
    deleteLoading.setLoading(true);

    await fetch(`/api/top-banners?bannerId=${bannerId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          setTopBannerList((prev) => prev.filter((banner) => banner.id !== bannerId));
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
    return <CreateUpdateTopBannerForm fetchBannerList={fetchBannerList} />;

  if (Boolean(searchParams.get("edit")) && selectedBanner)
    return (
      <CreateUpdateTopBannerForm fetchBannerList={fetchBannerList} editedBanner={selectedBanner} />
    );

  return (
    <div className="flex w-full flex-col items-stretch justify-start gap-0.5 px-2">
      <div className="flex items-center justify-between gap-2 md:px-4">
        <p className="text-lg font-bold md:text-xl">
          Danh sách banner
          <span className="hidden text-xs font-light md:inline">
            &emsp;{topBannerList.length ? `Tổng: ${topBannerList.length} banner` : ""}
          </span>
        </p>

        <Button
          color="success"
          onPress={() => {
            router.push(`${pathName}?tab=news&create=true`);
          }}
          startContent={<PlusIcon size={16} />}
        >
          <p className="hidden md:inline">Tạo banner</p>
        </Button>
      </div>
      {!topBannerList.length ? (
        <EmptyComponent title={"Chưa có banner nào"} />
      ) : (
        topBannerList.map((banner) => {
          const isInUse = banner.status;
          return (
            <div
              key={banner.id}
              className={`flex w-full items-start justify-start px-2 py-4 md:items-stretch`}
            >
              <Tooltip content={"Ngày banner được hiển thị"}>
                <div className={`border-default-300 flex items-center gap-2 px-2 md:border-b`}>
                  <p className="w-full text-xl font-semibold">
                    {getDateDetails(banner.active_at).date}
                  </p>
                  <div className="text-tiny flex items-center text-nowrap">
                    {getDateDetails(banner.active_at).month}
                    <span className="hidden lg:inline">
                      ,&ensp;{VIETNAMESE_WEEK_DAYS[getDateDetails(banner.active_at).weekDate]}
                    </span>
                  </div>
                </div>
              </Tooltip>

              <div className="border-default-300 flex w-full flex-col items-stretch justify-around gap-4 px-2 py-1 md:flex-row md:items-center md:border-b">
                <div className="flex flex-3 items-center justify-start gap-2">
                  <p className="line-clamp-1 text-sm font-semibold wrap-anywhere">{banner.title}</p>

                  <span className="shrink-0">
                    <Tooltip content={"Xem ảnh bìa"}>
                      {banner.image && (
                        <div>
                          <Image
                            src={banner.image}
                            alt={banner.title}
                            width={32}
                            height={20}
                            radius="none"
                            onClick={() => previewModal.onOpen()}
                          />
                          <ImagePreviewModal
                            isOpen={previewModal.isOpen}
                            onOpenChange={previewModal.onOpenChange}
                            onClose={previewModal.onClose}
                            src={banner.image}
                            alt={banner.title}
                          />
                        </div>
                      )}
                    </Tooltip>
                  </span>

                  {!banner.status && (
                    <span className="shrink-0">
                      <Tooltip content={"Đang ẩn"}>
                        <EyeSlashFilledIcon />
                      </Tooltip>
                    </span>
                  )}
                </div>

                <div className="flex justify-evenly gap-2 md:ml-auto md:justify-end">
                  <span className={`flex items-center justify-start gap-2 md:flex-1`}>
                    {banner.status &&
                      (new Date(banner.active_at) <= new Date(Date.now()) ? (
                        <Tooltip content={"Banner này đang được hiển thị trên HNB Hub."}>
                          <Chip
                            size="sm"
                            color="primary"
                            variant="shadow"
                            startContent={<CheckIcon size={16} />}
                          >
                            <p className="hidden md:inline">Đang hiển thị</p>
                          </Chip>
                        </Tooltip>
                      ) : (
                        <Countdown
                          date={banner.active_at}
                          renderer={({ days, hours, minutes, seconds, completed }) =>
                            completed ? (
                              <Tooltip content={"Banner này đang được hiển thị trên HNB Hub."}>
                                <Chip
                                  size="sm"
                                  color="primary"
                                  variant="shadow"
                                  startContent={<CheckIcon size={16} />}
                                >
                                  <p className="hidden md:inline">Đang hiển thị</p>
                                </Chip>
                              </Tooltip>
                            ) : (
                              <Tooltip content={"Thời gian còn lại để banner hiển thị."}>
                                <Chip color="primary" variant="dot" className="text-xs font-light">
                                  {days > 0
                                    ? `> ${days} ngày`
                                    : `${padTimeDisplay(hours)}:${padTimeDisplay(minutes)}:${padTimeDisplay(seconds)}`}
                                </Chip>
                              </Tooltip>
                            )
                          }
                        />
                      ))}
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
                          onClick={() => item.onClick?.(banner)}
                          hidden={
                            isInUse
                              ? ["activate", "delete"].some((key) => key === item.key)
                              : ["deactivate"].some((key) => key === item.key)
                          }
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

      {Boolean(topBannerList.length) && (
        <Pagination
          isCompact
          showControls
          total={Math.ceil(total / DEFAULT_PAGE_SIZE)}
          initialPage={1}
          page={currentPage}
          onChange={(page) => {
            setCurrentPage(page);
            fetchBannerList(page);
          }}
          className="mx-auto mt-4"
        />
      )}

      <ConfirmModal
        open={activateConfirmModal.isOpen}
        onOpenChange={activateConfirmModal.onOpenChange}
        onClose={activateConfirmModal.onClose}
        title="Xác nhận chọn hiển thị banner"
        extra="Chỉ 1 banner được hiển thị một lúc."
        onConfirm={() => {
          if (selectedBanner) handleUpdateBannerStatus(selectedBanner.id, true);
        }}
        okButtonProps={{
          color: "success",
        }}
        loading={updateStatusLoading.loading}
      />

      <ConfirmModal
        open={deactivateConfirmModal.isOpen}
        onOpenChange={deactivateConfirmModal.onOpenChange}
        onClose={deactivateConfirmModal.onClose}
        title="Xác nhận ngừng hiển thị banner"
        onConfirm={() => {
          if (selectedBanner) handleUpdateBannerStatus(selectedBanner.id, false);
        }}
        okButtonProps={{
          color: "warning",
        }}
        loading={updateStatusLoading.loading}
      />

      <ConfirmModal
        open={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        onClose={deleteModal.onClose}
        title="Xác nhận xóa banner"
        extra="Thao tác này không thể được hoàn tác"
        onConfirm={() => {
          if (selectedBanner) handleDeleteBanner(selectedBanner.id);
        }}
        okButtonProps={{
          color: "danger",
        }}
        loading={deleteLoading.loading}
      />
    </div>
  );
}
