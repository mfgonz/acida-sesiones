"use client";

import { useTransition } from "react";
import { cancelBooking } from "./actions";
import type { Booking, EventType } from "@/lib/types";

export function BookingRow({ booking, eventType, timezone }: { booking: Booking; eventType: EventType | undefined; timezone: string }) {
  const [isPending, startTransition] = useTransition();

  const start = new Date(booking.start_time);
  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(start);

  return (
    <div className="flex items-center justify-between rounded-lg border border-base-700 bg-base-900 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-white">{eventType?.name ?? "Session"}</p>
        <p className="mt-0.5 text-sm text-neutral-400">{formatted}</p>
        <p className="mt-0.5 text-xs text-neutral-500">
          {booking.invitee_name} · {booking.invitee_email}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {booking.meet_link && (
          <a href={booking.meet_link} target="_blank" className="text-sm text-accent hover:underline">
            Join
          </a>
        )}
        <button
          onClick={() => startTransition(() => cancelBooking(booking.id))}
          disabled={isPending}
          className="rounded-lg border border-base-600 px-3 py-1.5 text-sm text-neutral-300 hover:border-red-500 hover:text-red-400 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
