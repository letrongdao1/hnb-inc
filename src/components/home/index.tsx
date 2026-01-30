"use client";

import { UploadFile, UserStreak } from "@/interfaces/common";
import { Avatar, AvatarGroup, Badge, Chip, Image, Skeleton, Tooltip } from "@heroui/react";
import { useEffect, useState } from "react";
import { PostInfo } from "@/interfaces/news";
import { Event } from "@/interfaces/events";
import { useLoading } from "@/hooks/useLoading";
import { STATUS_CODE } from "@/constants/enums";
import Countdown from "react-countdown";
import { SpinningGlass } from "../events/SingleEvent";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import { CalendarIcon, CandleIcon, LocationIcon, NewsPaperIcon } from "../svg";
import Link from "next/link";
import { renderContentWithMentions } from "@/app/news/[slug]/PostInfo";
import { UserInfo } from "@/interfaces/user";
import StreakSection from "./StreakSection";
import EmptyComponent from "../empty/empty";
import { Sriracha } from "next/font/google";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const sriracha = Sriracha({ subsets: ["latin"], weight: "400" });

type HomeProps = {
  userStreak: UserStreak | null;
  nextBirthdayUsers: UserInfo[];
  randomImage: UploadFile | null;
};

export default function HomePage({ userStreak, nextBirthdayUsers, randomImage }: HomeProps) {
  const router = useRouter();

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

  const birthdayCakeCommonClassName = `mx-auto flex items-center justify-center border-6 shadow-[0_0_20px_rgba(236,72,153,0.6)] ${sriracha.className}`;

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
    <div className="flex w-full flex-col items-stretch gap-2 px-2 xl:max-w-2/3">
      <StreakSection userStreak={userStreak} />

      <div className="flex min-h-40 w-full flex-col items-stretch justify-between gap-2 overflow-hidden sm:flex-row">
        <div className="border-default-400 flex h-full flex-1 items-center justify-center rounded-xl border-2">
          {!nextBirthdayUsers.length ? (
            <></>
          ) : (
            <div className="flex flex-col items-stretch justify-end px-2 py-4">
              <AvatarGroup isBordered max={8} className="mx-auto">
                {nextBirthdayUsers.map((user) => (
                  <Tooltip key={user.id} content={user.display_name}>
                    <Avatar
                      src={user.avatar}
                      alt=""
                      size="md"
                      className="mx-auto mb-2 lg:scale-125"
                    />
                  </Tooltip>
                ))}
              </AvatarGroup>
              <div
                className={`${birthdayCakeCommonClassName} flex h-16 w-1/2 items-end justify-evenly rounded-t-xl border-b-0 border-red-400 text-3xl font-bold`}
              >
                <CandleIcon size={32} className="text-yellow-400" />
                <CandleIcon size={32} className="text-lime-400" />
              </div>
              <div
                className={`${birthdayCakeCommonClassName} flex h-20 w-2/3 items-end justify-evenly rounded-t-xl border-b-0 border-green-400 text-3xl font-bold`}
              >
                <CandleIcon size={32} className="text-orange-400" />
                <CandleIcon size={32} className="text-cyan-400" />
                <CandleIcon size={32} className="text-purple-400" />
              </div>
              <div
                className={`${birthdayCakeCommonClassName} h-24 w-64 rounded-xl border-blue-400 p-2 text-center sm:w-80`}
              ></div>
            </div>
          )}
        </div>

        <Link
          href={randomImage?.folder ? `/hnb-evird/folder/${randomImage?.folder}` : `#`}
          className="group border-default-400 relative flex-1 cursor-pointer overflow-hidden rounded-xl border-2"
        >
          <div
            className="z-10 h-full min-h-64 rounded-xl bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-out group-hover:scale-110 md:min-h-80"
            style={{ backgroundImage: `url(${randomImage?.url})` }}
          />

          {randomImage ? (
            <>
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/50 via-transparent to-black/50 opacity-0 duration-200 group-hover:opacity-100" />

              <div className="absolute inset-0 z-30 flex h-full w-full flex-col items-stretch justify-start gap-2 p-2 opacity-0 duration-200 group-hover:opacity-100">
                <p className="text-default-800 text-sm font-semibold">Daily Random Memory</p>
                <p className="mt-auto text-end text-xs font-light">
                  {dayjs(randomImage.created_at).format("DD/MM/YYYY")}
                </p>
              </div>
            </>
          ) : (
            <EmptyComponent imageSize={80} title="Không tìm thấy hình ảnh" />
          )}
        </Link>
      </div>

      <div className="flex w-full flex-1 flex-col items-stretch justify-center gap-2 sm:flex-row">
        <div className="h-full w-1/2">
          {!homeData.event ? (
            <div className="border-default-400 flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-12 text-center text-sm font-light opacity-50">
              <CalendarIcon size={40} />
              <p>Sắp tới chưa có sự kiện</p>
            </div>
          ) : (
            <Link
              href={`/events/${homeData.event.slug}`}
              className="group border-default-400 relative flex h-full min-h-40 w-full cursor-pointer flex-col items-stretch justify-center gap-2 overflow-hidden rounded-xl border-2 p-2 md:flex-row md:justify-between"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat duration-200 group-hover:scale-110"
                style={{
                  backgroundImage: homeData.event.image ? `url(${homeData.event.image})` : "none",
                }}
              />
              <div className="absolute inset-0 z-0 h-full w-full bg-black/70 group-hover:bg-black/50" />
              <div className="z-10 space-y-4 md:flex-1">
                <p className="line-clamp-2 text-center text-lg font-bold wrap-anywhere uppercase group-hover:underline md:text-start md:text-2xl">
                  {homeData.event.title}
                </p>

                <div className="hidden flex-wrap items-stretch justify-start gap-2 md:flex">
                  <Chip radius="sm" startContent={<CalendarIcon size={16} />} variant="bordered">
                    <span className="line-clamp-1">
                      <time dateTime={homeData.event.start_at}>
                        {new Date(homeData.event!.start_at!).toLocaleDateString("vi", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        &ensp;-&ensp;
                        {new Date(homeData.event!.start_at!).toLocaleTimeString("en", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </time>
                    </span>
                  </Chip>
                </div>
              </div>

              <div className="flex min-w-max shrink-0 flex-col items-center justify-center px-2">
                <Countdown
                  date={homeData.event.start_at}
                  renderer={({ days, hours, completed }) =>
                    completed ? (
                      <Chip
                        size="lg"
                        color="primary"
                        variant="shadow"
                        startContent={<SpinningGlass />}
                      >
                        Đang diễn ra
                      </Chip>
                    ) : (
                      <FlipClockCountdown
                        to={homeData.event!.start_at!}
                        renderMap={[days > 0, hours > 0, days === 0, days === 0 && hours === 0]}
                        labels={["Ngày", "Giờ", "Phút", "Giây"]}
                        digitBlockStyle={{ fontSize: 16, width: 20, height: 32 }}
                        dividerStyle={{ color: "transparent" }}
                        labelStyle={{ fontSize: 10 }}
                        spacing={{
                          clock: 4,
                        }}
                        separatorStyle={{ size: 3 }}
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
          )}
        </div>

        <div className="h-full w-1/2">
          {homeData.post ? (
            <Link
              href={`/news/${homeData.post.slug}`}
              className="group border-default-400 relative flex h-full w-full cursor-pointer flex-col items-stretch justify-between gap-2 overflow-hidden rounded-xl border-2 bg-auto p-2 md:flex-row"
            >
              <div className="absolute inset-0 z-0 h-full w-full bg-black/80" />
              <div className="z-10 flex w-full items-stretch gap-2">
                <div className="flex flex-1 flex-col items-stretch justify-between gap-4">
                  <p className="line-clamp-1 text-2xl font-bold uppercase group-hover:underline">
                    {homeData.post.title}
                  </p>
                  <span className="line-clamp-3 opacity-50">
                    {renderContentWithMentions(homeData.post.content || "")}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="border-default-400 flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-12 text-center text-sm font-light opacity-50">
              <NewsPaperIcon size={40} />
              <p>Hôm nay chưa có bản tin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
