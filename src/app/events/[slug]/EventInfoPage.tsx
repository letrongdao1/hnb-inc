"use client";

import EmptyComponent from "@/components/empty/empty";
import EventCostList from "@/components/events/EventCostList";
import { SpinningGlass } from "@/components/events/SingleEvent";
import {
  ArrowLeftIcon,
  CalendarCheckIcon,
  CalendarIcon,
  CheckIcon,
  LocationIcon,
  MoneyCashIcon,
  StarIcon,
  UserGroupIcon,
  XIcon,
} from "@/components/svg";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { STATUS_CODE } from "@/constants/enums";
import { useLoading } from "@/hooks/useLoading";
import { Event } from "@/interfaces/events";
import { useUser } from "@/providers/user.provider";
import {
  Accordion,
  AccordionItem,
  AccordionProps,
  addToast,
  Avatar,
  Button,
  Chip,
  Image,
  ScrollShadow,
  Spacer,
  useDisclosure,
} from "@heroui/react";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Countdown from "react-countdown";

export default function EventInfoPage({ event }: { event: Event }) {
  const router = useRouter();
  const { user: currentUser } = useUser();

  const confirmNotJoin = useDisclosure();
  const joinLoading = useLoading();

  const [selectedKeys, setSelectedKeys] = useState<AccordionProps["selectedKeys"]>(
    new Set(["1", "2", "3"])
  );
  const [participantList, setParticipantList] = useState<Event["participants"]>(
    event.participants || []
  );
  const [isJoinedStatus, setIsJoinedStatus] = useState<boolean>(Boolean(event.is_joined));

  const isEventInProgress = !event.is_ended && new Date() > new Date(event.start_at);

  const handleJoinEvent = async () => {
    if (!currentUser) return;

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
                      id: currentUser.id,
                      display_name: currentUser.display_name,
                      avatar: currentUser.avatar,
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
          setParticipantList((prev) => prev?.filter((p) => p.user.id !== currentUser?.id));
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

  if (!event)
    return (
      <EmptyComponent
        title="Không tìm thấy bài viết"
        description=""
        button={
          <Button
            onPress={() => router.replace("/news")}
            startContent={<ArrowLeftIcon />}
            variant="flat"
            className="text-inherit"
          >
            Trở về bảng tin
          </Button>
        }
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto flex w-full flex-col items-stretch justify-center gap-8 p-4"
    >
      <div className="flex w-full flex-col items-center justify-start gap-4">
        <div className="line-clamp-2 text-center text-lg font-bold tracking-wider wrap-anywhere md:text-3xl">
          {event.title}
        </div>

        {event.is_ended ? (
          <Chip
            size="sm"
            color="success"
            variant="shadow"
            startContent={<CalendarCheckIcon size={16} />}
          >
            Đã kết thúc
          </Chip>
        ) : (
          <Countdown
            date={event.start_at}
            renderer={({ days, completed }) =>
              completed ? (
                <Chip size="lg" color="primary" variant="shadow" startContent={<SpinningGlass />}>
                  Đang diễn ra
                </Chip>
              ) : days > 0 ? (
                <FlipClockCountdown
                  to={event.start_at}
                  renderMap={[true, true, false, false]}
                  labels={["Ngày", "Giờ", "Phút", "Giây"]}
                  digitBlockStyle={{ fontSize: 24, width: 24, height: 40 }}
                  labelStyle={{ fontSize: 12 }}
                  separatorStyle={{ size: 2 }}
                >
                  <></>
                </FlipClockCountdown>
              ) : (
                <FlipClockCountdown
                  to={event.start_at}
                  showLabels={false}
                  digitBlockStyle={{ fontSize: 16, width: 20, height: 32 }}
                  spacing={{
                    clock: 2,
                  }}
                  separatorStyle={{ size: 2 }}
                >
                  <Chip size="lg" color="primary" variant="shadow" startContent={<SpinningGlass />}>
                    Đang diễn ra
                  </Chip>
                </FlipClockCountdown>
              )
            }
          />
        )}

        <div className="flex flex-wrap items-stretch justify-center gap-2">
          <Chip radius="sm" startContent={<CalendarIcon size={16} />} variant="bordered">
            <p className="line-clamp-1">
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
            </p>
          </Chip>

          <Chip radius="sm" startContent={<LocationIcon size={16} />} variant="bordered">
            <div className="flex items-center justify-start gap-2">
              <p className="xs:max-w-64 max-w-40 overflow-hidden text-ellipsis whitespace-nowrap md:max-w-full">
                {event.venue_name}
              </p>
              {event.venue_instruction && (
                <a
                  href={event.venue_instruction}
                  target="_blank"
                  className="text-tiny inline shrink-0 underline"
                >
                  Link dẫn đường
                </a>
              )}
            </div>
          </Chip>
        </div>
      </div>

      <Accordion
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        variant="splitted"
        selectionMode="multiple"
        keepContentMounted
      >
        <AccordionItem
          key="1"
          startContent={<UserGroupIcon />}
          aria-label="Thành viên tham gia"
          title="Thành viên tham gia"
          subtitle={
            participantList &&
            Boolean(participantList.length) && (
              <p className="text-tiny">Tổng: {participantList.length}</p>
            )
          }
        >
          {!participantList?.length ? (
            <EmptyComponent title={"Chưa có thành viên tham gia"} />
          ) : (
            <div className="flex w-full flex-wrap items-stretch justify-start gap-3 py-2">
              {participantList.map((participant, index) => {
                const user = participant.user;
                const isYou = currentUser?.id === user.id;
                return (
                  <Chip
                    key={index}
                    size="lg"
                    variant="solid"
                    color={isYou ? "primary" : "default"}
                    avatar={<Avatar src={user.avatar} alt="" />}
                  >
                    {user.display_name}
                    {isYou && " (Bạn)"}
                  </Chip>
                );
              })}
            </div>
          )}
        </AccordionItem>
        <AccordionItem
          key="2"
          startContent={<MoneyCashIcon />}
          aria-label="Danh sách chi phí"
          title="Danh sách chi phí"
          subtitle={
            event.is_cost_split || !event.will_pay_user ? (
              <p className="text-tiny">
                Các khoản chi phí của mỗi thành viên được tổng hợp để tính toán khi kết thúc sự kiện
              </p>
            ) : (
              <p className="text-tiny font-semibold text-green-500">
                {event.will_pay_user.display_name}{" "}
                <span className="font-light">{event.is_ended ? "đã" : "sẽ"} chi trả toàn bộ chi phí cho sự kiện này</span>
              </p>
            )
          }
        >
          <EventCostList event={event} />
        </AccordionItem>
        <AccordionItem
          key="3"
          hidden
          aria-label="Chi tiết hoạt động"
          title="Chi tiết hoạt động"
        ></AccordionItem>
      </Accordion>

      <div
        className={`${!isJoinedStatus && "sticky bottom-1 z-10 mt-auto"} flex justify-center self-stretch bg-inherit`}
      >
        <Button
          fullWidth
          variant={isJoinedStatus ? "faded" : "solid"}
          color="success"
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
          hidden={isEventInProgress || event.is_ended}
          isLoading={joinLoading.loading}
          className="font-semibold"
        >
          {isJoinedStatus ? "Đã tham gia" : "Đăng ký tham gia"}
        </Button>
      </div>

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
    </motion.div>
  );
}
