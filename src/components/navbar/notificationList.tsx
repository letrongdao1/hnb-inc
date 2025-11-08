"use client";

import { useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Badge } from "@heroui/react";
import { useNotifications } from "@/providers/notification.provider";
import { BellIcon } from "../svg";

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
            className="absolute -top-1 -right-1"
          >
            <BellIcon className="text-default-700 h-6 w-6" />
          </Badge>
        </button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Thông báo" className="max-h-[320px] w-72 overflow-y-auto">
        {notifications.map((n) => (
          <DropdownItem
            key={n.id}
            className={`flex flex-col items-start gap-1 ${
              n.is_read
                ? "bg-content1 text-default-700"
                : "bg-primary-50 text-primary-800 font-medium"
            }`}
            onPress={() => markAsRead(n.id)}
          >
            <span>{n.title}</span>
            <span className="text-default-500 text-xs">
              {new Date(n.created_at).toLocaleString()}
            </span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
