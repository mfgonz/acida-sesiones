"use client";

import { useState, useTransition } from "react";
import { cancelBooking } from "./actions";
import { RescheduleModal } from "./reschedule-modal";
import { LOCATION_LABELS, type Booking, type EventType } from "@/lib/types";

export function BookingRow({
  booking,
  eventType,
  timezone,
  username,
  actionable = true,
}: {
  booking: Booking;
  eventType: EventType | undefined;
  timezone: string;
  username: string;
  actionable?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [rescheduling, setRescheduling] = useState(false);

  const start = new Date(booking.start_time);
  const time = new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(start);
  const duration = Math.round((new Date(booking.end_time).getTime() - start.getTime()) / 60000);
  const barColor = eventType?.color ?? (eventType?.audience === "existing" ? "#EAC5E6" : "#F5EFA7");

  function handleCancel() {
    if (!confirm(`¿Cancelar la sesión con ${booking.invitee_name}? Se le enviará un correo y se borrará del calendario.`)) return;
    startTransition(() => cancelBooking(booking.id));
  }

  return (
    <article
      className={`flex flex-wrap items-center gap-[18px] border-b border-ink py-[18px] ${
        booking.status === "canceled" ? "opacity-60" : ""
      }`}
    >
      <div className="flex w-[110px] shrink-0 flex-col gap-1">
        <span className="text-[32px] leading-[38px]">{time}</span>
        <span className="lbl">{duration} min</span>
      </div>
      <span className="w-2.5 shrink-0 self-stretch" style={{ background: barColor }} aria-hidden="true" />
      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
        <span className="text-lg leading-[25px]">
          {booking.invitee_name} · <span className="text-olive">{eventType?.name ?? "Sesión"}</span>
        </span>
        {booking.project_name && <span className="text-[13px] leading-[17px]">{booking.project_name}</span>}
        <span className="lbl break-all">
          {booking.invitee_email}
          {booking.invitee_phone && (
            <>
              {" · "}
              <a
                href={`https://wa.me/${booking.invitee_phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-terracotta"
              >
                {booking.invitee_phone}
              </a>
            </>
          )}
        </span>
      </div>
      {booking.meet_link ? (
        <a href={booking.meet_link} target="_blank" rel="noopener noreferrer" className="tag hover:bg-bone">
          Google Meet ↗
        </a>
      ) : eventType ? (
        <span className="tag">{LOCATION_LABELS[eventType.location_type]}</span>
      ) : null}
      {booking.status === "canceled" && <span className="tag tag-fill bg-bone">Cancelada</span>}
      {actionable && (
        <div className="flex gap-1.5">
          {eventType && (
            <button type="button" onClick={() => setRescheduling(true)} className="btn">
              Reprogramar
            </button>
          )}
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="btn border-transparent underline underline-offset-4 hover:bg-transparent hover:text-terracotta"
          >
            {isPending ? "Cancelando…" : "Cancelar"}
          </button>
        </div>
      )}

      {rescheduling && eventType && (
        <RescheduleModal
          bookingId={booking.id}
          username={username}
          slug={eventType.slug}
          onClose={() => setRescheduling(false)}
        />
      )}
    </article>
  );
}
