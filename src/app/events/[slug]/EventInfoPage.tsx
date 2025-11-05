"use client";

import EmptyComponent from "@/components/empty/empty";
import EventCostList from "@/components/events/EventCostList";
import {
  ArrowLeftIcon,
  CalendarIcon,
  LocationIcon,
  MoneyCashIcon,
  UserGroupIcon,
} from "@/components/svg";
import { Event } from "@/interfaces/events";
import { useUser } from "@/providers/user.providers";
import {
  Accordion,
  AccordionItem,
  AccordionProps,
  Avatar,
  Button,
  Chip,
  Image,
  ScrollShadow,
} from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventInfoPage({ event }: { event: Event }) {
  const router = useRouter();
  const { user: currentUser } = useUser();

  const [selectedKeys, setSelectedKeys] = useState<AccordionProps["selectedKeys"]>(
    new Set(["1", "2", "3"])
  );

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

  const defaultContent =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit mollitia repellendus a atque facilis! Recusandae vero adipisci suscipit quasi esse numquam fuga iusto in mollitia, autem ullam necessitatibus quos qui cumque odio ex. Ratione voluptatum id atque dignissimos eligendi voluptatibus consectetur distinctio cumque dicta minima. Delectus culpa nulla quo sint?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto flex w-full items-start justify-center p-4"
    >
      <ScrollShadow className="w-full">
        <div className="flex w-full flex-col items-stretch justify-start gap-4">
          <div className="line-clamp-2 text-center text-lg font-bold tracking-wider wrap-anywhere md:text-3xl">
            {event.title}
          </div>

          <div className="flex flex-wrap items-stretch justify-start gap-2">
            <Chip radius="sm" startContent={<CalendarIcon size={16} />} variant="bordered">
              <p className="line-clamp-1">
                <time dateTime={event.start_date}>
                  {new Date(event.start_date).toLocaleDateString("vi", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                {event.start_time && (
                  <time dateTime={event.start_time} className="ml-1">
                    {new Date(`1970-01-01T${event.start_time}`).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </time>
                )}
              </p>
            </Chip>

            <Chip radius="sm" startContent={<LocationIcon size={16} />} variant="bordered">
              <span className="line-clamp-1">
                {event.venue_name}
                {event.venue_instruction && (
                  <>
                    &emsp;
                    <a
                      href={event.venue_instruction}
                      target="_blank"
                      className="text-tiny inline underline"
                    >
                      Link dẫn đường
                    </a>
                  </>
                )}
              </span>
            </Chip>
          </div>
        </div>

        <Accordion
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          variant="splitted"
          selectionMode="multiple"
        >
          <AccordionItem
            key="1"
            startContent={<UserGroupIcon />}
            aria-label="Thành viên tham gia"
            title="Thành viên tham gia"
            subtitle={
              event.participants &&
              Boolean(event.participants.length) && (
                <p className="text-tiny">Tổng: {event.participants.length}</p>
              )
            }
          >
            {!event.participants || !event.participants.length ? (
              <EmptyComponent
                title={
                  <span className="py-16 text-sm font-light opacity-70">
                    Chưa có thành viên tham gia
                  </span>
                }
                isShowImage={false}
              />
            ) : (
              <div className="flex w-full flex-wrap items-stretch justify-start gap-3 py-2">
                {event.participants.map((participant, index) => {
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
              <p className="text-tiny">
                Các khoản chi phí của mỗi thành viên được tổng hợp để tính toán khi kết thúc sự kiện
              </p>
            }
          >
            <EventCostList eventId={event.id} />
          </AccordionItem>
          <AccordionItem key="3" hidden aria-label="Chi tiết hoạt động" title="Chi tiết hoạt động">
            {defaultContent}
          </AccordionItem>
        </Accordion>
      </ScrollShadow>
    </motion.div>
  );
}
