"use client";

import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Divider,
  Button,
  Image,
  useDisclosure,
} from "@heroui/react";
import { useNotifications } from "@/providers/notification.provider";
import { BellIcon, CalendarIcon, DeleteIcon, NewsPaperIcon } from "../svg";
import { CommonUtils } from "@/utils/common.utils";
import NOTIFICATION_IMAGE from "@/assets/images/notification.png";
import ConfirmModal from "../ui/modal/ConfirmModal";
import { useLoading } from "@/hooks/useLoading";
import { useRouter } from "next/navigation";
import { NOTIFICATION_TYPE } from "@/constants/enums";
import { REACT_IMAGE_SRC } from "@/constants/constants";

const ICON_SIZE = 24;

export default function NotificationList() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAsReadAll, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const confirmDeleteModal = useDisclosure();
  const deleteLoading = useLoading();

  return (
    <>
      <Dropdown
        placement="bottom"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        classNames={{
          content: "p-0 rounded-xl overflow-hidden shadow-xl border border-divider",
        }}
      >
        <DropdownTrigger>
          <button className="hover:bg-default-50 relative cursor-pointer rounded-md p-2 duration-200 focus:outline-none">
            <Badge
              content={unreadCount}
              color="danger"
              size="md"
              className="absolute"
              hidden={!unreadCount}
            >
              <BellIcon className="text-default-700 h-6 w-6" />
            </Badge>
          </button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Thông báo"
          className="max-h-[320px] w-72 overflow-y-auto md:w-90"
          disabledKeys={["empty"]}
        >
          {!notifications.length ? (
            <DropdownItem key={"empty"}>
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Image
                  src={NOTIFICATION_IMAGE.src}
                  alt="notification"
                  className="aspect-square w-20"
                />
                <p className="text-xs font-light">Thông báo sẽ hiện ở đây</p>
              </div>
            </DropdownItem>
          ) : (
            <>
              <DropdownItem
                key={"notification_actions"}
                startContent={
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={confirmDeleteModal.onOpen}
                  >
                    Xóa tất cả
                  </Button>
                }
                endContent={
                  <Button size="sm" variant="light" color="secondary" onPress={markAsReadAll}>
                    Đánh dấu đã đọc tất cả
                  </Button>
                }
                closeOnSelect={false}
                isReadOnly
                showDivider
              >
                <></>
              </DropdownItem>

              {notifications.map((noti) => (
                <DropdownItem
                  key={noti.id}
                  closeOnSelect={!!noti.href}
                  onPress={() => {
                    if (!noti.is_read) markAsRead(noti.id);
                    if (noti.href) router.push(noti.href);
                  }}
                  className={`flex flex-col items-stretch gap-2 ${!noti.is_read && "border-default-400 border-2"}`}
                >
                  <Badge
                    isOneChar
                    color="danger"
                    shape="circle"
                    content={<BellIcon size={10} />}
                    className="absolute -top-1 -right-1 border-none"
                    classNames={{
                      base: "w-full",
                    }}
                    hidden={noti.is_read}
                  >
                    <div className="flex max-h-40 min-h-12 w-full items-stretch gap-3 overflow-hidden text-ellipsis">
                      <div className="flex w-12 shrink-0 items-start justify-center pt-2">
                        {getNotiDisplayStyle(noti.type)?.icon}
                      </div>
                      <div className="w-full flex-1">
                        <p className="text-[0.7em] float-right pt-0.5 md:pl-1 font-light opacity-75">
                          {CommonUtils.getTimeComparedToNow(noti.created_at)}
                        </p>
                        <p className="font-semibold wrap-anywhere text-ellipsis">
                          {noti.title}:&ensp;
                          <span className="text-sm font-light wrap-anywhere">
                            {noti.description}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Badge>
                </DropdownItem>
              ))}
            </>
          )}
        </DropdownMenu>
      </Dropdown>

      <ConfirmModal
        open={confirmDeleteModal.isOpen}
        onOpenChange={confirmDeleteModal.onOpenChange}
        onClose={confirmDeleteModal.onClose}
        title={"Xóa tất cả thông báo"}
        extra={<span className="text-red-500">Không thể hoàn tác sau khi xóa</span>}
        onConfirm={() => {
          clearAll();
          confirmDeleteModal.onClose();
        }}
        confirmText="Xóa tất cả"
        okButtonProps={{
          color: "danger",
          startContent: !deleteLoading.loading && <DeleteIcon />,
          isLoading: deleteLoading.loading,
        }}
      />
    </>
  );
}

export const getNotiDisplayStyle = (type: NOTIFICATION_TYPE) => {
  switch (type) {
    case NOTIFICATION_TYPE.GENERAL:
      break;
    case NOTIFICATION_TYPE.POST:
      return {
        icon: <NewsPaperIcon size={ICON_SIZE} />,
      };
    case NOTIFICATION_TYPE.REACTION_LIKE:
      return {
        icon: (
          <Image src={REACT_IMAGE_SRC.like} alt="" className="aspect-square w-full object-cover" />
        ),
      };
    case NOTIFICATION_TYPE.REACTION_DISLIKE:
      return {
        icon: (
          <Image
            src={REACT_IMAGE_SRC.dislike}
            alt=""
            className="aspect-square w-full object-cover"
          />
        ),
      };
    case NOTIFICATION_TYPE.EVENT:
      return {
        icon: <CalendarIcon size={ICON_SIZE} />,
      };
    case NOTIFICATION_TYPE.OTHER:
    default:
      return {
        icon: <BellIcon size={ICON_SIZE} />,
      };
  }
};
