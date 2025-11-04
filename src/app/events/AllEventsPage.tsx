"use client";

import React, { useState } from "react";
import { PageTitle } from "@/components/ui/text/text";
import { Event } from "@/interfaces/events";
import SingleEvent from "@/components/events/SingleEvent";

export default function AllEventsPage({ events }: { events: Event[] }) {
  return (
    <div className="w-full space-y-2 lg:max-w-2/3">
      <PageTitle>Tất cả sự kiện</PageTitle>

      <div className="flex w-full flex-col items-stretch gap-2">
        {events.map((event) => (
          <SingleEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
