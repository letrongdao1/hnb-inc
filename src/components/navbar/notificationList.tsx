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
} from "@heroui/react";
import { useNotifications } from "@/providers/notification.provider";
import { BellIcon } from "../svg";
import { CommonUtils } from "@/utils/common.utils";

export default function NotificationList() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      placement="bottom"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      classNames={{
        content: "p-0 rounded-xl overflow-hidden shadow-xl border border-divider",
      }}
    >
      <DropdownTrigger>
        <button className="hover:bg-default-100 relative rounded-full p-2 focus:outline-none">
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

      <DropdownMenu aria-label="Thông báo" className="max-h-[320px] w-72 overflow-y-auto md:w-90">
        <>
          <DropdownItem
            key={"notification_actions"}
            startContent={
              <Button size="sm" variant="light" color="danger">
                Xóa tất cả
              </Button>
            }
            endContent={
              <Button size="sm" variant="light" color="secondary">
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
      </DropdownMenu>
    </Dropdown>
  );
}
