"use client";

import { CalendarIcon, NewsPaperIcon } from "@/components/svg";
import { PageTitle } from "@/components/ui/text";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function HubManagementLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathName = usePathname();

  const tabItems = [
    {
      href: "/management/hub/news",
      label: "Quản lý bảng tin",
      icon: <NewsPaperIcon />,
    },
    {
      href: "/management/hub/events",
      label: "Quản lý sự kiện",
      icon: <CalendarIcon />,
    },
  ];

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
            const isActive = item.href === pathName;
            return (
              <Link
                key={item.href}
                href={item.href}
                // onClick={() => router.push(item.href)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md md:flex-none md:justify-start ${
                  isActive ? "bg-default-300" : "cursor-pointer opacity-50 hover:opacity-100"
                } p-2 px-2 duration-200`}
              >
                {item.icon}
                <p className="hidden md:inline">{item.label}</p>
              </Link>
            );
          })}
        </div>

        <div className="mx-auto flex min-h-40 w-full flex-1 flex-col items-center md:flex-1/2 md:border-l">
          {children}
        </div>
      </div>
    </div>
  );
}
