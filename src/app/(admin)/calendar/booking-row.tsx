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
    <div className="flex items-center justify-between rounded-lg border border-ink/10 bg-white/60 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-ink">{eventType?.name ?? "Session"}</p>
        <p className="mt-0.5 text-sm text-ink/60">{formatted}</p>
        <p className="mt-0.5 text-xs text-ink/50">
          {booking.invitee_name} · {booking.invitee_email}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {booking.meet_link && (
          <a href={booking.meet_link} target="_blank" className="text-sm text-terracotta hover:underline">
            Join
          </a>
        )}
        <button
          onClick={() => startTransition(() => cancelBooking(booking.id))}
          disabled={isPending}
          className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm text-ink/70 transition hover:border-red-500 hover:text-red-600 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
