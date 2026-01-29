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
  BeerIcon,
  CalendarCheckIcon,
  CheckIcon,
  DeleteIcon,
  EditIcon,
  ImageIcon,
  MoreIcon,
  PlusIcon,
} from "@/components/svg";
import { CommonUtils } from "@/utils/common.utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Countdown from "react-countdown";
import { Event } from "@/interfaces/events";
import CreateUpdateEventForm from "@/components/management/hub/events/CreateUpdateEventForm";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import ImagePreviewModal from "@/components/ui/preview-modal";

export default function EventsManagement() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { loading, setLoading } = useLoading();

  const deleteModal = useDisclosure();
  const deleteLoading = useLoading();

  const endNowModal = useDisclosure();
  const endNowLoading = useLoading();

  const previewModal = useDisclosure();

  const [eventList, seEventList] = useState<Event[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<Event>();

  const actionMenuItems = [
    {
      key: "end_now",
      label: "Kết thúc sự kiện",
      icon: <CheckIcon size={16} />,
      color: "success",
      onClick: (event: Event) => {
        setSelectedEvent(event);
        endNowModal.onOpen();
      },
    },
    {
      key: "edit",
      label: "Cập nhật sự kiện",
      icon: <EditIcon size={16} />,
      color: "primary",
      onClick: (event: Event) => {
        setSelectedEvent(event);
        router.push(`${pathName}?tab=events&edit=true`);
      },
      disabled: false,
    },
    {
      key: "delete",
      label: "Xóa sự kiện",
      icon: <DeleteIcon size={16} />,
      color: "danger",
      onClick: (event: Event) => {
        setSelectedEvent(event);
        deleteModal.onOpen();
      },
    },
  ];

  const fetchEventList = useCallback(
    async (pageIndex?: number) => {
      setLoading(true);

      await fetch(`/api/events?pageIndex=${pageIndex || 1}&pageSize=${DEFAULT_PAGE_SIZE}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            seEventList(result.data || []);
            setTotal(result.count || 0);
          }
        })
        .catch(() => {
          addToast({
            title: "Lỗi lấy danh sách sự kiện!",
            color: "danger",
          });
        })
        .finally(() => {
          setLoading(false);
          setSelectedEvent(undefined);
        });
    },
    [setLoading]
  );

  useEffect(() => {
    fetchEventList();
  }, [fetchEventList]);

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

  const handleEndEvent = async (eventId: string) => {
    endNowLoading.setLoading(true);

    await fetch(`/api/events/end?eventId=${eventId}`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          fetchEventList();
          addToast({
            title: result.message,
            description: "Cảm ơn bạn đã dành thời gian cho sự kiện!",
            color: "primary",
          });
        } else {
          addToast({ title: result.message, color: "danger" });
        }
      })
      .finally(() => {
        endNowLoading.setLoading(false);
        endNowModal.onClose();
      });
  };

  const handleDeleteEvent = async (eventId: string) => {
    deleteLoading.setLoading(true);

    await fetch(`/api/events?eventId=${eventId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          seEventList((prev) => prev.filter((event) => event.id !== eventId));
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
    return <CreateUpdateEventForm fetchEventList={fetchEventList} />;

  if (Boolean(searchParams.get("edit")) && selectedEvent)
    return <CreateUpdateEventForm fetchEventList={fetchEventList} editedEvent={selectedEvent} />;

  return (
    <div className="flex w-full flex-col items-stretch justify-start gap-0.5 px-2">
      <div className="flex items-center justify-between gap-2 md:px-4">
        <p className="text-lg font-bold md:text-xl">
          Danh sách sự kiện
          <span className="hidden text-xs font-light md:inline">
            &emsp;{eventList.length ? `Tổng: ${eventList.length} sự kiện` : ""}
          </span>
        </p>

        <Button
          color="success"
          onPress={() => {
            router.push(`${pathName}?tab=events&create=true`);
          }}
          startContent={<PlusIcon size={16} />}
        >
          <p className="hidden md:inline">Tạo sự kiện</p>
        </Button>
      </div>
      {!eventList.length ? (
        <EmptyComponent title={"Chưa có sự kiện nào"} />
      ) : (
        eventList.map((event, index) => {
          const isDateHidden =
            index > 0 && CommonUtils.compareDate(eventList[index - 1].start_at, event.start_at);
          const isOngoing = !event.is_ended && new Date(event.start_at) < new Date(Date.now());
          return (
            <div key={event.id} className={`flex w-full items-stretch justify-start px-2 py-4`}>
              <Tooltip content={"Ngày sự kiện diễn ra"}>
                <div
                  className={`border-default-300 hidden items-center gap-2 border-b px-2 sm:flex ${isDateHidden && "invisible"}`}
                >
                  <p className="w-full text-xl font-semibold">
                    {getDateDetails(event.start_at).date}
                  </p>
                  <div className="text-tiny flex items-center text-nowrap">
                    {getDateDetails(event.start_at).month}
                    <span className="hidden lg:inline">
                      ,&ensp;{VIETNAMESE_WEEK_DAYS[getDateDetails(event.start_at).weekDate]}
                    </span>
                  </div>
                </div>
              </Tooltip>

              <div className="border-default-300 flex w-full items-center justify-around gap-4 border-b px-2 py-1">
                <div className="flex flex-3 items-center justify-start gap-2">
                  <p className="line-clamp-1 text-sm font-semibold wrap-anywhere">{event.title}</p>
                  <span className="hidden shrink-0 sm:inline">
                    <Tooltip content={"Có sử dụng bia, rượu"}>
                      {event.has_alcohol && <BeerIcon size={16} className="text-amber-500" />}
                    </Tooltip>
                  </span>
                  <span className="shrink-0">
                    <Tooltip content={"Xem ảnh bìa"}>
                      {event.image && (
                        <div>
                          <Image
                            src={event.image}
                            alt={event.title}
                            width={32}
                            height={20}
                            radius="none"
                            onClick={() => previewModal.onOpen()}
                          />
                          <ImagePreviewModal
                            isOpen={previewModal.isOpen}
                            onOpenChange={previewModal.onOpenChange}
                            onClose={previewModal.onClose}
                            src={event.image}
                            alt={event.title}
                          />
                        </div>
                      )}
                    </Tooltip>
                  </span>
                </div>

                <span className={`flex flex-1 justify-center`}>
                  {event.is_ended ? (
                    <Tooltip content={"Sự kiện đã kết thúc."}>
                      <Chip size="sm" color="success" variant="shadow">
                        <CalendarCheckIcon size={16} />
                      </Chip>
                    </Tooltip>
                  ) : (
                    <Countdown
                      date={event.start_at}
                      renderer={({ days, hours, minutes, seconds, completed }) =>
                        completed ? (
                          <Tooltip content={"Sự kiện đang diễn ra."}>
                            <Chip size="sm" color="primary" variant="shadow">
                              <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                                style={{ animationDuration: "8s" }}
                              >
                                <path
                                  fill="currentColor"
                                  d="M6 2v6h.01L12 12l5.99-4H18V2H6zm0 20h12v-6h-.01L12 12l-5.99 4H6v6z"
                                />
                              </svg>
                            </Chip>
                          </Tooltip>
                        ) : (
                          <Tooltip content={"Thời gian còn lại đến giờ diễn ra sự kiện."}>
                            <Chip color="default" variant="bordered" className="text-xs font-light">
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
                          onClick={() => item.onClick?.(event)}
                          hidden={!isOngoing && item.key === "end_now"}
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

      {Boolean(eventList.length) && (
        <Pagination
          isCompact
          showControls
          total={Math.ceil(total / DEFAULT_PAGE_SIZE)}
          initialPage={1}
          page={currentPage}
          onChange={(page) => {
            setCurrentPage(page);
            fetchEventList(page);
          }}
          className="mx-auto mt-4"
        />
      )}

      <ConfirmModal
        open={endNowModal.isOpen}
        onOpenChange={endNowModal.onOpenChange}
        onClose={endNowModal.onClose}
        title="Xác nhận kết thúc sự kiện"
        description=""
        extra="Thao tác này không thể được hoàn tác"
        onConfirm={() => {
          if (selectedEvent) handleEndEvent(selectedEvent.id);
        }}
        confirmText="Kết thúc sự kiện"
        okButtonProps={{
          color: "success",
          startContent: !endNowLoading.loading && <CheckIcon />,
        }}
        loading={endNowLoading.loading}
      />

      <ConfirmModal
        open={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        onClose={deleteModal.onClose}
        title="Xác nhận xóa sự kiện"
        extra="Thao tác này không thể được hoàn tác"
        onConfirm={() => {
          if (selectedEvent) handleDeleteEvent(selectedEvent.id);
        }}
        okButtonProps={{
          color: "danger",
        }}
        loading={deleteLoading.loading}
      />
    </div>
  );
}
