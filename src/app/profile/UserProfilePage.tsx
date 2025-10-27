"use client";

import PersonalInfo from "@/components/profile/PersonalInfo";
import QRManagement from "@/components/profile/QRManagement";
import { EditIcon, QRIcon, UserIcon } from "@/components/svg";
import { UserInfo } from "@/interfaces/user";
import { useUser } from "@/providers/user.providers";
import { Avatar, Button, Divider } from "@heroui/react";
import React, { useEffect, useMemo, useState } from "react";

interface UserProfilePageProps {
  user: UserInfo | null;
}

export default function UserProfilePage() {
  const { user } = useUser();

  const tabItems = [
    {
      label: "Thông tin tài khoản",
      key: "account",
      icon: <UserIcon />,
      element: <PersonalInfo user={user} />,
    },
    {
      label: "QR nhận tiền",
      key: "qr",
      icon: <QRIcon />,
      element: <QRManagement />,
    },
  ];

  const [activeKey, setActiveKey] = useState<string>(tabItems[0].key);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && tabItems.some((item) => item.key === hash)) {
      setActiveKey(hash);
    }
  }, []);

  const currentElement = useMemo(() => {
    return tabItems.find((item) => item.key === activeKey)?.element || null;
  }, [activeKey]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    window.history.replaceState(null, "", `#${key}`);
  };

  if (!user) return null;

  return (
    <div className="flex w-full flex-col items-stretch justify-start gap-4 rounded-md">
      <div className="flex flex-col items-center justify-between gap-2 md:flex-row md:px-16">
        <div className="flex flex-1 flex-col items-center gap-2 sm:gap-4 md:flex-row">
          <Avatar src={user.avatar} alt="avatar" className="h-16 w-16 md:h-40 md:w-40" isBordered />
          <p className="text-2xl font-semibold md:text-4xl">{user.display_name}</p>
        </div>

        <Button startContent={<EditIcon size={16} />} variant="flat" className="text-inherit">
          <p className="text-xs md:text-sm">Cập nhật ảnh đại diện</p>
        </Button>
      </div>

      <Divider />

      <div className="flex items-stretch justify-between gap-1 px-1 py-4">
        <div className="flex min-h-40 shrink flex-col items-stretch gap-2 md:min-w-xs">
          {tabItems.map((item) => {
            const isActive = item.key === activeKey;

            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`flex items-center justify-start gap-2 rounded-md ${isActive && "border"} p-2 px-2 duration-200 hover:brightness-75`}
              >
                {item.icon}
                <p className={`hidden md:inline`}>{item.label}</p>
              </button>
            );
          })}
        </div>

        <div className="mx-auto flex min-h-40 flex-1 flex-col items-center border-l md:flex-1/2">
          {currentElement}
        </div>
      </div>
    </div>
  );
}
