import { TopBanner as ITopBanner } from "@/interfaces/common";
import {
  Alert,
  AlertProps,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import React from "react";
import { SettingIcon, XIcon } from "../svg";
import { LOCAL_STORAGE_KEY, TOP_BANNER_TYPE } from "@/constants/enums";
import { motion } from "framer-motion";

const ICON_SIZE = 16;

export default function TopBanner({
  topBanner,
  isShowTopBanner,
  setIsShowTopBanner,
}: {
  topBanner: ITopBanner | undefined;
  isShowTopBanner: boolean;
  setIsShowTopBanner: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const showModal = useDisclosure();

  const handleHideTopBanner = () => {
    if (topBanner) {
      localStorage.setItem(LOCAL_STORAGE_KEY.HIDDEN_TOP_BANNER, topBanner.id.toString());
    }
    setIsShowTopBanner(false);
  };

  const getTopBannerDisplay = () => {
    switch (topBanner?.type) {
      case TOP_BANNER_TYPE.SYSTEM:
        return {
          icon: <SettingIcon size={ICON_SIZE} className="shrink-0" />,
          color: "primary",
        };
      case TOP_BANNER_TYPE.HOLIDAY:
      case TOP_BANNER_TYPE.REMINDER:
      default:
        return {
          icon: <></>,
          color: "default",
        };
    }
  };

  if (!topBanner) return <></>;

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5, ease: "easeIn" }}
      onClick={showModal.onOpen}
      className="sticky top-0 left-0 z-10 mt-1 flex w-full flex-col items-stretch px-1"
    >
      <div className="absolute inset-0 z-40 h-full w-full" />
      <Alert
        title={
          <p className="line-clamp-3 text-xs font-semibold">
            {topBanner.title}: <span className="font-light">{topBanner.content}</span>
            {topBanner.extra && (
              <span className="text-tiny font-light opacity-50">&emsp;{topBanner.extra}</span>
            )}
          </p>
        }
        variant="flat"
        color={getTopBannerDisplay().color as AlertProps["color"]}
        radius="sm"
        hideIcon
        startContent={getTopBannerDisplay().icon}
        endContent={
          <Button
            color="default"
            size="sm"
            variant="light"
            isIconOnly
            startContent={<XIcon size={12} />}
            onPress={handleHideTopBanner}
            className="opacity-50"
          />
        }
        className="z-50 mx-auto flex-1 py-1 md:max-h-10 xl:max-w-5/6"
      />

      <Modal isOpen={showModal.isOpen} onOpenChange={showModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-start gap-2 text-lg font-semibold">
                <span className="mt-2">{getTopBannerDisplay().icon}</span>
                {topBanner.title}
              </ModalHeader>
              <ModalBody>
                <p className="">{topBanner.content}</p>
                <p className="text-tiny font-light opacity-75">{topBanner.extra}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
