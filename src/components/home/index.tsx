"use client";

import LogoComponent from "@/components/logo/logo";
import Maintenance from "@/components/maintenance";
import { UserStreak } from "@/interfaces/common";
import { Button, Chip, Image, Skeleton } from "@heroui/react";
import { FireAnimatedIcon } from "../svg/complex";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import { useEffect, useState } from "react";
import { PostInfo } from "@/interfaces/news";
import { Event } from "@/interfaces/events";
import { useLoading } from "@/hooks/useLoading";
import { STATUS_CODE } from "@/constants/enums";
import Countdown from "react-countdown";
import { SpinningGlass } from "../events/SingleEvent";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import { CalendarIcon, LocationIcon } from "../svg";
import Link from "next/link";
import { renderContentWithMentions } from "@/app/news/[slug]/PostInfo";
import DetailPageLoader from "../loader/DetailPageLoader";

type HomeProps = {
  userStreak: UserStreak | null;
};

export default function HomePage({ userStreak }: HomeProps) {
  const [homeData, setHomeData] = useState<{
    post: Partial<PostInfo> | null;
    event: Partial<Event> | null;
  }>({
    post: null,
    event: null,
  });
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    const fetchHomeData = async () => {
      await fetch("/api/home")
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            setHomeData(result.data);
          }
        })
        .finally(() => setLoading(false));
    };

    fetchHomeData();
  }, [setLoading]);

  if (loading)
    return (
      <div className="flex w-full flex-col gap-4 p-6 md:gap-8 xl:max-w-2/3">
        <div className="flex items-stretch justify-between gap-2 md:gap-4">
          <Skeleton className="h-8 w-2/3 rounded-lg" />
          <Skeleton className="h-8 w-1/3 rounded-lg" />
        </div>

        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-stretch justify-start gap-2 md:gap-4">
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="flex w-full flex-col items-stretch gap-4 px-2 xl:max-w-2/3">
      <HeroSection userStreak={userStreak} />

      {homeData.event && (
        <div className="space-y-2">
          <p className="px-2 text-xs font-light">Sự kiện sắp tới</p>

          <Link
            href={`/events/${homeData.event.slug}`}
            className="group relative flex min-h-40 w-full cursor-pointer flex-col items-stretch justify-center gap-2 overflow-hidden rounded-md border p-2 md:flex-row md:justify-between"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat duration-200 group-hover:scale-110"
              style={{
                backgroundImage: homeData.event.image ? `url(${homeData.event.image})` : "none",
              }}
            />
            <div className="absolute inset-0 z-0 h-full w-full bg-black/70 group-hover:bg-black/50" />
            <div className="z-10 space-y-4 md:flex-1">
              <p className="text-center text-lg font-bold wrap-anywhere uppercase group-hover:underline md:text-start md:text-2xl">
                {homeData.event.title}
              </p>

              <div className="hidden flex-wrap items-stretch justify-start gap-2 md:flex">
                <Chip radius="sm" startContent={<CalendarIcon size={16} />} variant="bordered">
                  <p className="line-clamp-1">
                    <time dateTime={homeData.event.start_at}>
                      {new Date(homeData.event!.start_at!).toLocaleDateString("vi", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      &ensp;
                      {new Date(homeData.event!.start_at!).toLocaleTimeString("en", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </time>
                  </p>
                </Chip>

                <Chip radius="sm" startContent={<LocationIcon size={16} />} variant="bordered">
                  <p className="xs:max-w-64 max-w-40 overflow-hidden text-ellipsis whitespace-nowrap md:max-w-full">
                    {homeData.event.venue_name}
                  </p>
                </Chip>
              </div>
            </div>

            <div className="flex min-w-max shrink-0 flex-col items-center justify-center px-2 md:pr-12">
              <Countdown
                date={homeData.event.start_at}
                renderer={({ days, completed }) =>
                  completed ? (
                    <Chip
                      size="lg"
                      color="primary"
                      variant="shadow"
                      startContent={<SpinningGlass />}
                    >
                      Đang diễn ra
                    </Chip>
                  ) : days > 0 ? (
                    <FlipClockCountdown
                      to={homeData.event!.start_at!}
                      renderMap={[true, true, false, false]}
                      labels={["Ngày", "Giờ", "Phút", "Giây"]}
                      digitBlockStyle={{ fontSize: 20, width: 20, height: 32 }}
                      labelStyle={{ fontSize: 8 }}
                      separatorStyle={{ size: 2 }}
                    >
                      <></>
                    </FlipClockCountdown>
                  ) : (
                    <FlipClockCountdown
                      to={homeData.event!.start_at!}
                      showLabels={false}
                      digitBlockStyle={{ fontSize: 16, width: 20, height: 32 }}
                      spacing={{
                        clock: 2,
                      }}
                      separatorStyle={{ size: 2 }}
                    >
                      <Chip
                        size="lg"
                        color="primary"
                        variant="shadow"
                        startContent={<SpinningGlass />}
                      >
                        Đang diễn ra
                      </Chip>
                    </FlipClockCountdown>
                  )
                }
              />
            </div>
          </Link>
        </div>
      )}

      <div className="space-y-2">
        <p className="px-2 text-xs font-light">Bản tin hôm nay</p>

        {homeData.post ? (
          <Link
            href={`/news/${homeData.post.slug}`}
            className="group relative flex w-full cursor-pointer flex-col items-stretch justify-between gap-2 overflow-hidden rounded-md border bg-auto p-2 md:flex-row"
          >
            <div className="absolute inset-0 z-0 h-full w-full bg-black/80" />
            <div className="z-10 flex w-full items-stretch gap-2">
              <div className="flex flex-1 flex-col items-stretch justify-between gap-4">
                <p className="text-lg font-bold uppercase group-hover:underline">
                  {homeData.post.title}
                </p>
                <span className="line-clamp-3 opacity-50">
                  {renderContentWithMentions(homeData.post.content || "")}
                </span>
              </div>
              {homeData.post.image ? (
                <span className="flex flex-1 items-center justify-center">
                  <Image src={homeData.post.image} alt="" className="max-w-40 rounded-md" />
                </span>
              ) : (
                <></>
              )}
            </div>
          </Link>
        ) : (
          <p className="border-default-200 rounded-md border py-16 text-center text-sm font-light opacity-50">
            Chưa có bản tin hôm nay
          </p>
        )}
      </div>

      <p className="text-tiny mt-auto pt-20 text-center opacity-50">
        Tính năng mới sẽ xuất hiện ở đây
      </p>
    </div>
  );
}
