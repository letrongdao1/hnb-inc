"use client";

import {
  Avatar,
  Badge,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
} from "@heroui/react";
import { UserGroupIcon } from "../svg";
import { useOnlineStatusContext } from "@/providers/online-status.provider";
import { UserInfo } from "@/interfaces/user";
import { useMemo, useState } from "react";
import { useUser } from "@/providers/user.provider";
import { ActivityStatus } from "@/hooks/useOnlineStatusWithActivity";
import { CommonUtils } from "@/utils/common.utils";

export default function FriendListDrawer({ availableUserList }: { availableUserList: UserInfo[] }) {
  const [currentUserList, setCurrentUserList] = useState<UserInfo[]>(availableUserList);

  const { user } = useUser();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { onlineUserIds, myStatus, getStatus } = useOnlineStatusContext();

  const onlineOtherUserIds = useMemo(
    () => onlineUserIds.filter((id) => user && id !== user.id),
    [onlineUserIds, user]
  );

  const getStatusDisplay = (status: ActivityStatus | null, user?: UserInfo) => {
    if (!status) {
      return {
        color: "default" as any,
        text:
          user && user.last_active
            ? `Hoạt động ${CommonUtils.getTimeComparedToNow(user.last_active).toLowerCase()}`
            : "",
      };
    }

    switch (status) {
      case "online":
        return { color: "success" as any, text: "Đang hoạt động" };
      case "away":
        return { color: "warning" as any, text: "Tạm vắng" };
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={onOpen}
        className="hover:bg-default-50 relative cursor-pointer rounded-md p-2 duration-200 focus:outline-none"
      >
        <Badge
          color="success"
          size="sm"
          content={onlineOtherUserIds.length}
          hidden={!onlineOtherUserIds.length}
        >
          <UserGroupIcon className="h-6 w-6" />
        </Badge>
      </button>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="xs">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="flex gap-2 py-6">
                <UserGroupIcon />
                <p>Danh sách nhân viên</p>
              </DrawerHeader>
              <DrawerBody>
                <div className="flex items-center gap-2 px-1 py-2">
                  <Badge
                    content=""
                    color={getStatusDisplay(myStatus).color}
                    placement="bottom-right"
                    shape="circle"
                  >
                    <Avatar src={user.avatar} alt={user.display_name} />
                  </Badge>

                  <div className="flex-1">
                    <span className="flex items-center gap-1 font-semibold">
                      {user.display_name}
                    </span>
                    <p className="text-xs font-light">{getStatusDisplay(myStatus).text}</p>
                  </div>
                </div>

                <Divider />

                <div className="flex flex-col items-stretch justify-start gap-2">
                  {currentUserList
                    .filter((u) => user && u.id !== user.id)
                    .map((user) => {
                      const onlineStatusDisplay = getStatusDisplay(getStatus(user.id), user);

                      return (
                        <div key={user.id} className="flex items-center gap-2 px-1 py-2">
                          <Badge
                            content=""
                            color={onlineStatusDisplay.color}
                            placement="bottom-right"
                            shape="circle"
                          >
                            <Avatar src={user.avatar} alt={user.display_name} />
                          </Badge>

                          <div className="flex-1">
                            <p className="line-clamp-1 font-semibold">{user.display_name}</p>
                            <p className="text-xs font-light">{onlineStatusDisplay.text}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
