"use client";

import React, { useState } from "react";
import { PageTitle } from "@/components/ui/text/text";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { PlusIcon } from "@/components/svg";
import { Event } from "@/interfaces/events";
import SingleEvent from "@/components/events/SingleEvent";
import Carousel from "@/components/ui/carousel/Carousel";

export default function AllEventsPage({
  events,
  canCreate = true,
}: {
  events: Event[];
  canCreate?: boolean;
}) {
  const pathName = usePathname();
  const router = useRouter();

  const [isHoverAdd, setIsHoverAdd] = useState<boolean>(false);

  return (
    <div className="w-full space-y-2 lg:max-w-2/3">
      <PageTitle>Tất cả sự kiện</PageTitle>

      {Boolean(canCreate) && (
        <motion.div
          layout
          onMouseEnter={() => setIsHoverAdd(true)}
          onMouseLeave={() => setTimeout(() => setIsHoverAdd(false), 500)}
          className="fixed right-16 bottom-6 z-50 flex origin-center items-center justify-center"
          transition={{ type: "keyframes", stiffness: 100, damping: 20 }}
        >
          <motion.div layout className={`rounded-full shadow-lg ${isHoverAdd ? "px-4" : "px-3"}`}>
            <Button
              color="primary"
              onPress={() => router.push(`${pathName}/create`)}
              className="text-primary-foreground bg-primary flex items-center gap-2 rounded-full text-sm font-medium"
            >
              <PlusIcon size={20} />
              <AnimatePresence>
                {isHoverAdd && (
                  <motion.span
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    Tạo sự kiện
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </motion.div>
      )}

      <div className="flex w-full flex-col items-stretch gap-2">
        {events.map((event) => (
          <SingleEvent key={event.id} event={event} />
        ))}
      </div>

      <Carousel cards={[]} />
    </div>
  );
}
