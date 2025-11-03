"use client";

import NewsManagement from "@/components/management/hub/news/NewsManagement";
import { CalendarIcon, NewsPaperIcon } from "@/components/svg";
import { PageTitle } from "@/components/ui/text/text";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventsManagement from "@/components/management/hub/events/EventsManagement";

export default function HubManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabItems = useMemo(
    () => [
      {
        key: "news",
        label: "Quản lý bảng tin",
        icon: <NewsPaperIcon />,
        element: <NewsManagement />,
      },
      {
        key: "events",
        label: "Quản lý sự kiện",
        icon: <CalendarIcon />,
        element: <EventsManagement />,
      },
    ],
    []
  );

  const initialTab = searchParams.get("tab") || tabItems[0].key;
  const [activeKey, setActiveKey] = useState<string>(initialTab);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && tabItems.some((item) => item.key === currentTab)) {
      setActiveKey(currentTab);
    }
  }, [searchParams, tabItems]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);

    const params = new URLSearchParams(window.location.search);
    params.set("tab", key);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);
  };

  const currentElement = useMemo(
    () => tabItems.find((item) => item.key === activeKey)?.element || null,
    [activeKey, tabItems]
  );

  return (
    <div className="flex w-full flex-col items-stretch justify-start gap-4 rounded-md">
      <div>
        <PageTitle extra="Điều khiển nội dung hiển thị trên HNB Hub" className="!pb-2">
          Quản lý nội dung
        </PageTitle>
      </div>

      <div className="flex w-full flex-col items-stretch justify-between gap-4 px-1 py-4 md:flex-row md:gap-1">
        <div className="flex shrink flex-row items-stretch gap-2 md:min-h-40 md:min-w-64 md:flex-col">
          {tabItems.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md md:flex-none md:justify-start ${
                  isActive ? "bg-default-300" : "cursor-pointer opacity-50 hover:opacity-100"
                } p-2 px-2 duration-200`}
              >
                {item.icon}
                <p className="hidden md:inline">{item.label}</p>
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
