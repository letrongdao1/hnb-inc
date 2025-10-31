"use client";

import { Event } from "@/interfaces/events";
import React, { useMemo, useState } from "react";
import { CalendarIcon, CheckIcon, LocationIcon, StarIcon, UserIcon, XIcon } from "../svg";
import { Avatar, AvatarGroup, Button, Chip, useDisclosure } from "@heroui/react";
import ConfirmModal from "../ui/modal/ConfirmModal";

const MAX_TAG_SHOWN = 2;

export default function SingleEvent({ event }: { event: Event }) {
  const confirmNotJoin = useDisclosure();

  const [isJoinedStatus, setIsJoinedStatus] = useState<boolean>(Boolean(event.is_joined));

  const tagList = useMemo(() => (event.tags ? event.tags.split(",") : []), [event]);

  const handleJoin = async () => {
    setIsJoinedStatus(true);
  };

  const handleNotJoin = async () => {
    setIsJoinedStatus(false);
    confirmNotJoin.onClose();
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-lg px-8 pt-8 pb-4 border-2 border-default-400">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat duration-200 group-hover:scale-110"
        style={{ backgroundImage: event.image ? `url(${event.image})` : "none" }}
      />

      <div className="transition-background absolute inset-0 bg-black/80 duration-200 group-hover:bg-black/50" />

      <div className="relative z-10 space-y-2 text-white">
        <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
          <p className="line-clamp-1 max-w-[20em] font-bold uppercase group-hover:underline md:text-2xl">
            {event.title}
          </p>

          <span className="text-tiny flex items-center gap-2 rounded-4xl bg-teal-600 px-3 py-1 md:text-sm">
            <UserIcon size={16} />
            Sắp diễn ra
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-1 md:gap-2">
          <span className="flex items-center gap-1 px-3 py-1 text-xs md:text-sm">
            <LocationIcon size={16} />
            <p className="line-clamp-1 max-w-[20em]">{event.venue_name}</p>
          </span>

          <span className="flex items-center gap-1 px-3 py-1 text-xs md:text-sm">
            <CalendarIcon size={16} />
            <time dateTime={event.start_date}>
              {new Date(event.start_date).toLocaleDateString("vi", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            {event.start_time && (
              <time dateTime={event.start_time}>
                {new Date(`1970-01-01T${event.start_time}`).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </time>
            )}
          </span>

          {tagList.length && (
            <div className="flex items-center justify-start">
              {tagList.slice(0, MAX_TAG_SHOWN).map((tag) => (
                <Chip key={tag} color="default" variant="light">
                  <p className="text-xs font-light">#{tag}</p>
                </Chip>
              ))}
              {tagList.length > MAX_TAG_SHOWN && (
                <span className="text-tiny">+{tagList.length - MAX_TAG_SHOWN}</span>
              )}
            </div>
          )}
        </div>

        <div className="md;items-stretch flex flex-col items-center justify-between gap-2 md:mt-16 md:flex-row">
          {event.participants && (
            <AvatarGroup
              isBordered
              max={5}
              total={event.participants.length}
              renderCount={(count) => (
                <p className="text-small ms-2 font-semibold text-white">+{count}</p>
              )}
            >
              {event.participants.map((user) => (
                <Avatar key={user.id} src={user.avatar} alt="avatar" />
              ))}
            </AvatarGroup>
          )}

          <div className="flex w-full items-center justify-between gap-1 md:ml-auto md:w-fit md:gap-4">
            <Button variant="light" color="default" className="hover:underline">
              Xem chi tiết
            </Button>
            <Button
              variant={isJoinedStatus ? "light" : "solid"}
              color="success"
              className="font-semibold"
              startContent={isJoinedStatus ? <CheckIcon /> : <StarIcon />}
              onPress={() => {
                if (isJoinedStatus) {
                  confirmNotJoin.onOpen();
                } else {
                  handleJoin();
                }
              }}
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
                startContent: <XIcon size={16} />,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
