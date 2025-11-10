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
import { BellIcon, DeleteIcon } from "../svg";
import { CommonUtils } from "@/utils/common.utils";
import NOTIFICATION_IMAGE from "@/assets/images/notification.png";
import ConfirmModal from "../ui/Modal/ConfirmModal";
import { useLoading } from "@/hooks/useLoading";

export default function NotificationList() {
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
                    <div className="flex w-full items-start gap-3">
                      <BellIcon size={24} className="shrink-0" />
                      <div className="flex flex-1 flex-col items-stretch gap-2">
                        <div className="w-full">
                          <p className="text-tiny float-right pt-0.5 font-light">
                            {CommonUtils.getTimeComparedToNow(noti.created_at)}
                          </p>
                          <p className="font-semibold wrap-anywhere">{noti.title}</p>
                        </div>
                        <p className="text-sm font-light wrap-anywhere">{noti.description}</p>
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
