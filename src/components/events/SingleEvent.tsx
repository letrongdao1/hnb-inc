"use client";

import { Event, EventStatusEnum } from "@/interfaces/events";
import React, { useMemo, useState } from "react";
import {
  CalendarCheckIcon,
  CalendarIcon,
  CheckIcon,
  LocationIcon,
  StarIcon,
  UserIcon,
  XIcon,
} from "../svg";
import { addToast, Avatar, AvatarGroup, Button, Chip, Tooltip, useDisclosure } from "@heroui/react";
import { useLoading } from "@/hooks/useLoading";
import { STATUS_CODE } from "@/constants/enums";
import { useUser } from "@/providers/user.provider";
import { usePathname, useRouter } from "next/navigation";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import Countdown from "react-countdown";
import ConfirmModal from "../ui/modal/ConfirmModal";

const MAX_TAG_SHOWN = 2;
const MAX_AVATAR_SHOWN = 5;

export const SpinningGlass = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" style={{ animationDuration: "8s" }}>
    <path
      fill="currentColor"
      d="M6 2v6h.01L12 12l5.99-4H18V2H6zm0 20h12v-6h-.01L12 12l-5.99 4H6v6z"
    />
  </svg>
);

export default function SingleEvent({ event }: { event: Event }) {
  const router = useRouter();
  const pathName = usePathname();
  const { user } = useUser();
  const confirmNotJoin = useDisclosure();
  const joinLoading = useLoading();

  const [participantList, setParticipantList] = useState<Event["participants"]>(
    event.participants || []
  );
  const [isJoinedStatus, setIsJoinedStatus] = useState<boolean>(Boolean(event.is_joined));

  const tagList = useMemo(() => (event.tags ? event.tags.split(",") : []), [event]);

  const isEventInProgress =
    event.status !== EventStatusEnum.ENDED && new Date() > new Date(event.start_at);

  const handleViewDetail = () => {
    router.push(`${pathName}/${event.slug}`);
  };

  const handleJoinEvent = async () => {
    if (!user) return;

    joinLoading.setLoading(true);

    await fetch("/api/events/participation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId: event.id }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          setParticipantList((prev) =>
            prev
              ? [
                  ...prev,
                  {
                    event: event.id,
                    created_at: new Date().toISOString(),
                    user: {
                      id: user.id,
                      display_name: user.display_name,
                      avatar: user.avatar,
                    },
                  },
                ]
              : prev
          );
          setIsJoinedStatus(true);
          addToast({ title: result.message, color: "success" });
        } else {
          addToast({ title: result.message, color: "danger" });
        }
      })
      .catch((error) => {
        addToast({ title: error, color: "danger" });
      })
      .finally(() => {
        joinLoading.setLoading(false);
      });
  };

  const handleNotJoin = async () => {
    joinLoading.setLoading(true);

    await fetch("/api/events/participation", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId: event.id }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          setIsJoinedStatus(false);
          setParticipantList((prev) => prev?.filter((p) => p.user.id !== user?.id));
        } else {
          addToast({ title: result.message, color: "danger" });
        }
      })
      .catch((error) => {
        addToast({ title: error, color: "danger" });
      })
      .finally(() => {
        confirmNotJoin.onClose();
        joinLoading.setLoading(false);
      });
  };

  return (
    <div className="group border-default-400 relative w-full overflow-hidden rounded-lg border-2 p-4 md:p-8 md:pb-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat duration-200 group-hover:scale-110"
        style={{ backgroundImage: event.image ? `url(${event.image})` : "none" }}
      />

      <div className="transition-background absolute inset-0 bg-black/80 duration-200 group-hover:bg-black/50" />

      <div className="relative z-10 space-y-2 text-white">
        <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
          <p
            onClick={handleViewDetail}
            className="line-clamp-1 max-w-[20em] text-lg font-bold uppercase group-hover:underline md:text-2xl"
          >
            {event.title}
          </p>

          {event.status === EventStatusEnum.ENDED ? (
            <Chip color="success" variant="shadow" startContent={<CalendarCheckIcon size={16} />}>
              Đã kết thúc
            </Chip>
          ) : (
            <Countdown
              date={event.start_at}
              renderer={({ days, completed }) =>
                completed ? (
                  <Chip
                    color={event.status === EventStatusEnum.IN_PROGRESS ? "primary" : "secondary"}
                    variant="shadow"
                    startContent={<SpinningGlass />}
                  >
                    {event.status === EventStatusEnum.IN_PROGRESS
                      ? "Đang diễn ra"
                      : "Đang tổng kết"}
                  </Chip>
                ) : days > 0 ? (
                  <FlipClockCountdown
                    to={event.start_at}
                    renderMap={[true, true, false, false]}
                    labels={["Ngày", "Giờ", "Phút", "Giây"]}
                    digitBlockStyle={{ fontSize: 16, width: 20, height: 40 }}
                    labelStyle={{ fontSize: 12 }}
                    separatorStyle={{ size: 2 }}
                  >
                    <></>
                  </FlipClockCountdown>
                ) : (
                  <FlipClockCountdown
                    to={event.start_at}
                    showLabels={false}
                    renderMap={[false, true, true, true]}
                    digitBlockStyle={{ fontSize: 16, width: 20, height: 32 }}
                    dividerStyle={{ color: "transparent" }}
                    spacing={{
                      clock: 2,
                    }}
                    separatorStyle={{ size: 2 }}
                  >
                    <Chip color="primary" variant="shadow" startContent={<SpinningGlass />}>
                      Đang diễn ra
                    </Chip>
                  </FlipClockCountdown>
                )
              }
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-start gap-1 md:gap-2">
          <span className="flex items-center gap-1 px-3 py-1 text-xs md:text-sm">
            <LocationIcon size={16} />
            <p className="line-clamp-1 max-w-[50em]">{event.venue_name}</p>
          </span>

          <span className="flex items-center gap-1 px-3 py-1 text-xs md:text-sm">
            <CalendarIcon size={16} />
            <time dateTime={event.start_at}>
              {new Date(event.start_at).toLocaleDateString("vi", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              &ensp;
              {new Date(event.start_at).toLocaleTimeString("en", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </time>
          </span>

          {tagList.length && (
            <div className="flex items-center justify-start">
              {tagList.slice(0, MAX_TAG_SHOWN).map((tag) => (
                <Chip key={tag} color="default" variant="light">
                  <p className="text-xs font-light text-white">#{tag}</p>
                </Chip>
              ))}
              {tagList.length > MAX_TAG_SHOWN && (
                <span className="text-tiny">+{tagList.length - MAX_TAG_SHOWN}</span>
              )}
            </div>
          )}
        </div>

        <div className="md;items-stretch flex flex-col items-start justify-between gap-2 px-2 md:mt-16 md:flex-row md:items-center">
          {participantList && (
            <AvatarGroup
              isBordered
              max={MAX_AVATAR_SHOWN}
              total={participantList.length}
              renderCount={(count) =>
                count > MAX_AVATAR_SHOWN ? (
                  <p className="text-small ms-2 font-semibold text-white">
                    +{count - MAX_AVATAR_SHOWN}
                  </p>
                ) : null
              }
            >
              {participantList.map((participant) => {
                const isYou = user && user.id === participant.user.id;
                return (
                  <Tooltip
                    key={participant.user.id}
                    content={
                      isYou ? (
                        `Bạn`
                      ) : (
                        <div className="flex items-center gap-1">
                          <p className="min-w-fit text-sm font-semibold text-nowrap">
                            {participant.user.display_name}
                          </p>
                          <span className="min-w-fit font-light">sẽ tham gia</span>
                        </div>
                      )
                    }
                  >
                    <Avatar
                      src={participant.user.avatar}
                      alt="avatar"
                      color={participant.user.id === user?.id ? "primary" : "default"}
                    />
                  </Tooltip>
                );
              })}
            </AvatarGroup>
          )}

          <div className="flex w-full items-center justify-between gap-1 md:ml-auto md:w-fit md:gap-4">
            <Button
              onPress={handleViewDetail}
              variant="light"
              color="default"
              className="text-white hover:underline"
            >
              Xem chi tiết
            </Button>
            <Button
              variant={isJoinedStatus ? "light" : "solid"}
              color="success"
              className="font-semibold"
              startContent={
                joinLoading.loading ? null : isJoinedStatus ? (
                  <CheckIcon size={16} />
                ) : (
                  <StarIcon size={16} />
                )
              }
              onPress={() => {
                if (isJoinedStatus) {
                  confirmNotJoin.onOpen();
                } else {
                  handleJoinEvent();
                }
              }}
              hidden={isEventInProgress || event.status === EventStatusEnum.ENDED}
              isLoading={joinLoading.loading}
            >
              {isJoinedStatus ? "Đã tham gia" : "Đăng ký tham gia"}
            </Button>

            <ConfirmModal
              open={confirmNotJoin.isOpen}
              onOpenChange={confirmNotJoin.onOpenChange}
              onClose={handleNotJoin}
              onConfirm={confirmNotJoin.onClose}
              title={"Xác nhận hủy đăng ký tham gia"}
              description={""}
              extra={
                <>
                  Chúng tôi sẽ nhớ bạn <span className="not-italic">&#129402;</span>
                </>
              }
              confirmText="Ở lại sự kiện"
              cancelText="Hủy đăng ký"
              okButtonProps={{
                color: "success",
              }}
              cancelButtonProps={{
                color: "danger",
                startContent: !joinLoading.loading && <XIcon size={16} />,
                isLoading: joinLoading.loading,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
