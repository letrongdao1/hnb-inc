"use client";

import {
  ArrowLeftIcon,
  HomeIcon,
  HorizontalLayoutIcon,
  MasonryLayoutIcon,
  UploadIcon,
} from "@/components/svg";
import { BreadcrumbItem, Breadcrumbs, Button, Tooltip, useDisclosure } from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import UploadAssetsModal from "../upload-modal";

type DisPlayLayoutType = "list" | "masonry";

const LAYOUT_SESSION_KEY = "fdl";

export default function EvirdActionBar() {
  const router = useRouter();
  const { path } = useParams();

  const [currentDisplayLayout, setCurrentDisplayLayout] = useState<DisPlayLayoutType>("list");

  const uploadModal = useDisclosure();

  const pathArray = Array.isArray(path) ? path : [path];

  useEffect(() => {
    const sessionLayout = sessionStorage.getItem(LAYOUT_SESSION_KEY);
    if (sessionLayout) {
      setCurrentDisplayLayout(sessionLayout as DisPlayLayoutType);
    }
  }, []);

  const handleSwitchLayout = (type: DisPlayLayoutType) => {
    setCurrentDisplayLayout(type);
    sessionStorage.setItem(LAYOUT_SESSION_KEY, type);
  };

  return (
    <div className="space-y-2">
      <div className="border-default-300 flex w-full items-stretch justify-between gap-2 border-b px-1 py-2 md:px-2">
        {pathArray.filter((p) => Boolean(p)).length ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              isIconOnly
              startContent={<ArrowLeftIcon size={20} />}
              color="default"
              variant="light"
              onPress={() => router.back()}
            />

            <div className="hidden md:block">
              <Breadcrumbs
                onAction={(key) => {
                  if (Number(key) < 0) {
                    router.push("/hnb-evird/folder");
                  } else {
                    router.push(
                      `/hnb-evird/folder/${pathArray.slice(0, Number(key) + 1).join("/")}`
                    );
                  }
                }}
              >
                <BreadcrumbItem key={-1}>
                  <HomeIcon size={20} />
                </BreadcrumbItem>
                {pathArray.map((path, index) => (
                  <BreadcrumbItem key={index}>{path}</BreadcrumbItem>
                ))}
              </Breadcrumbs>
            </div>
          </div>
        ) : (
          <p className="my-auto text-xl font-bold md:text-3xl">HNB Evird</p>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* <div className="flex items-stretch justify-center rounded-xl">
            <button
              onClick={() => handleSwitchLayout("list")}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-l-md border px-2 py-1 md:px-4 ${currentDisplayLayout === "list" ? "ring-1" : "opacity-50"} duration-200`}
            >
              <Tooltip content={"Hiển thị kiểu danh sách"} placement="top" offset={10}>
                <HorizontalLayoutIcon />
              </Tooltip>
            </button>

            <button
              onClick={() => handleSwitchLayout("masonry")}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-r-md border px-2 py-1 md:px-4 ${currentDisplayLayout === "masonry" ? "ring-1" : "opacity-50"} duration-200`}
            >
              <Tooltip content={"Hiển thị kiểu lưới"} placement="top" offset={10}>
                <MasonryLayoutIcon />
              </Tooltip>
            </button>
          </div> */}

          <Button
            color="success"
            startContent={<UploadIcon size={16} />}
            onPress={() => uploadModal.onOpen()}
          >
            <p className="hidden md:inline">Tải file lên</p>
          </Button>
        </div>
      </div>

      <div
        className={`${pathArray.filter((p) => Boolean(p)).length > 0 ? "block" : "hidden"} px-2 md:hidden`}
      >
        <Breadcrumbs
          onAction={(key) => {
            if (Number(key) < 0) {
              router.push("/hnb-evird/folder");
            } else {
              router.push(`/hnb-evird/folder/${pathArray.slice(0, Number(key) + 1).join("/")}`);
            }
          }}
        >
          <BreadcrumbItem key={-1}>
            <HomeIcon size={16} />
          </BreadcrumbItem>
          {pathArray.map((path, index) => (
            <BreadcrumbItem key={index}>
              <p className="text-xs">{path}</p>
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>

      <UploadAssetsModal
        isOpen={uploadModal.isOpen}
        onOpenChange={uploadModal.onOpenChange}
        onClose={uploadModal.onClose}
      />
    </div>
  );
}
