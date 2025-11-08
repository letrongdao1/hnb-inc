"use client";

import BankAccountManagement from "@/components/profile/BankAccountManagement";
import ChangeAvatar from "@/components/profile/ChangeAvatar";
import PersonalInfo from "@/components/profile/PersonalInfo";
import { BankCardIcon, EditIcon, UserIcon } from "@/components/svg";
import { ANNOUNCEMENT_TYPE } from "@/constants/enums";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { useUser } from "@/providers/user.providers";
import {
  Avatar,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect, useMemo, useState } from "react";

export default function UserProfilePage() {
  const { user } = useUser();
  const { announce } = useAnnouncement();
  const changeAvatarModal = useDisclosure();

  const tabItems = useMemo(
    () => [
      {
        label: "Thông tin tài khoản",
        key: "account",
        icon: <UserIcon />,
        element: <PersonalInfo user={user} />,
      },
      {
        label: "Tài khoản nhận tiền",
        key: "bank",
        icon: <BankCardIcon />,
        element: <BankAccountManagement user={user} />,
      },
    ],
    [user]
  );

  const [activeKey, setActiveKey] = useState<string>(tabItems[0].key);

  const currentElement = useMemo(() => {
    return tabItems.find((item) => item.key === activeKey)?.element || null;
  }, [activeKey, tabItems]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && tabItems.some((item) => item.key === hash)) {
      setActiveKey(hash);
    }
  }, [tabItems]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    window.history.replaceState(null, "", `#${key}`);
  };

  if (!user) return null;

  return (
    <div className="flex w-full flex-col items-stretch justify-start gap-4 rounded-md">
      <div className="flex flex-col items-center justify-between gap-2 md:flex-row md:px-16">
        <div className="flex flex-1 flex-col items-center gap-2 sm:gap-8 md:flex-row">
          <Avatar src={user.avatar} alt="avatar" className="h-16 w-16 md:h-40 md:w-40" isBordered />
          <p className="text-2xl font-semibold md:text-4xl">{user.display_name}</p>
        </div>

        <Button
          onPress={() => {
            changeAvatarModal.onOpen();
          }}
          startContent={<EditIcon size={16} />}
          color="primary"
          variant="flat"
        >
          <p className="text-xs md:text-sm">Cập nhật ảnh đại diện</p>
        </Button>

        <Modal
          placement="center"
          isOpen={changeAvatarModal.isOpen}
          onOpenChange={changeAvatarModal.onOpenChange}
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">Cập nhật ảnh đại diện</ModalHeader>
                <ModalBody>
                  <ChangeAvatar onClose={changeAvatarModal.onClose} />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>

      <Divider />

      <div className="flex w-full flex-col items-stretch justify-between gap-4 px-1 py-4 md:flex-row md:gap-1">
        <div className="flex shrink flex-row items-stretch gap-2 md:min-h-40 md:min-w-xs md:flex-col">
          {tabItems.map((item) => {
            const isActive = item.key === activeKey;

            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md md:flex-none md:justify-start ${isActive ? "bg-default-300" : "cursor-pointer opacity-50 hover:opacity-100"} p-2 px-2 duration-200`}
              >
                {item.icon}
                <p className={`hidden md:inline`}>{item.label}</p>
              </button>
            );
          })}
        </div>

        <div className="mx-auto flex min-h-40 w-full flex-1 flex-col items-center md:flex-1/2 md:border-l">
          {currentElement}
        </div>
      </div>
    </div>
  );
}
