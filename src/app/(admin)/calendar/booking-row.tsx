"use client";

import { useState, useTransition } from "react";
import { CalendarClock } from "lucide-react";
import { cancelBooking } from "./actions";
import { RescheduleModal } from "./reschedule-modal";
import type { Booking, EventType } from "@/lib/types";

export function BookingRow({
  booking,
  eventType,
  timezone,
  username,
}: {
  booking: Booking;
  eventType: EventType | undefined;
  timezone: string;
  username: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [rescheduling, setRescheduling] = useState(false);

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
        <p className="text-base font-medium text-ink">{eventType?.name ?? "Session"}</p>
        <p className="mt-0.5 text-base text-ink/60">{formatted}</p>
        <p className="mt-0.5 text-sm text-ink/50">
          {booking.invitee_name} · {booking.invitee_email}
          {booking.invitee_phone && <> · {booking.invitee_phone}</>}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {booking.invitee_phone && (
          <a
            href={`https://wa.me/${booking.invitee_phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            className="text-base text-terracotta hover:underline"
          >
            WhatsApp
          </a>
        )}
        {booking.meet_link && (
          <a href={booking.meet_link} target="_blank" className="text-base text-terracotta hover:underline">
            Join
          </a>
        )}
        {eventType && (
          <button
            onClick={() => setRescheduling(true)}
            className="flex items-center gap-1.5 rounded-[6px] border border-ink/15 px-3 py-1.5 text-base text-ink/70 transition hover:border-terracotta hover:text-ink"
          >
            <CalendarClock size={14} /> Reschedule
          </button>
        )}
        <button
          onClick={() => startTransition(() => cancelBooking(booking.id))}
          disabled={isPending}
          className="rounded-[6px] border border-ink/15 px-3 py-1.5 text-base text-ink/70 transition hover:border-red-500 hover:text-red-600 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>

      {rescheduling && eventType && (
        <RescheduleModal
          bookingId={booking.id}
          username={username}
          slug={eventType.slug}
          onClose={() => setRescheduling(false)}
        />
      )}
    </div>
  );
}
