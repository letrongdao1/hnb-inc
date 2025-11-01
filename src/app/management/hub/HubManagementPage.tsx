"use client";

import PostManagement from "@/components/management/hub/PostManagement";
import { CalendarIcon, NewsPaperIcon } from "@/components/svg";
import { PageTitle } from "@/components/ui/text/text";
import React, { useEffect, useMemo, useState } from "react";

export default function HubManagementPage() {
  const tabItems = useMemo(
    () => [
      {
        label: "Quản lý bảng tin",
        key: "news",
        icon: <NewsPaperIcon />,
        element: <PostManagement />,
      },
      {
        label: "Quản lý sự kiện",
        key: "events",
        icon: <CalendarIcon />,
        element: <></>,
      },
    ],
    []
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
