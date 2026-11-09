"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, MoreVertical, Trash2, Pencil, Check, Power } from "lucide-react";
import { LocationIcon } from "@/components/location-icon";
import { toggleEventTypeActive, deleteEventType } from "./actions";
import { LOCATION_LABELS, type EventType } from "@/lib/types";

const AUDIENCE_LABELS: Record<EventType["audience"], string> = {
  new: "Nuevos clientes",
  existing: "Clientes actuales",
};

export function EventTypeCard({ eventType, bookingUrl }: { eventType: EventType; bookingUrl: string }) {
  const [isActive, setIsActive] = useState(eventType.is_active);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !isActive;
    setIsActive(next);
    startTransition(() => toggleEventTypeActive(eventType.id, next));
  }

  function handleCopy() {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className={`group relative flex flex-col border bg-white/60 p-5 transition ${
        isActive ? "border-ink/10 hover:border-terracotta hover:bg-white" : "border-ink/10 opacity-60"
      }`}
      style={{ borderTopWidth: 4, borderTopColor: isActive ? eventType.color : undefined }}
    >
      <div className="mb-4 flex items-start justify-between">
        <LocationIcon locationType={eventType.location_type} color={eventType.color} size={16} />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-[6px] p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            aria-label="More actions"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 z-10 mt-1 w-40 border border-ink/10 bg-white py-1 shadow-lg"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                href={`/scheduling/${eventType.id}/edit`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink/70 hover:bg-ink/5"
              >
                <Pencil size={14} /> Edit
              </Link>
              <button
                onClick={handleToggle}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink/70 hover:bg-ink/5"
              >
                <Power size={14} /> {isActive ? "Turn Off" : "Turn On"}
              </button>
              <button
                onClick={() => startTransition(() => deleteEventType(eventType.id))}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-ink/5"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="font-display text-lg text-ink">{eventType.name}</p>
      <p className="mt-1 font-label text-xs uppercase tracking-wide text-ink/50">
        {eventType.duration_minutes} min · {LOCATION_LABELS[eventType.location_type]}
      </p>

      {eventType.description && (
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink/70">{eventType.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
        <span className="font-label text-xs uppercase tracking-wide text-ink/40">
          {AUDIENCE_LABELS[eventType.audience]}
        </span>

        {isActive ? (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-[6px] border border-ink/15 px-3 py-1.5 text-sm text-ink/70 transition hover:border-terracotta hover:text-ink"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy link"}
          </button>
        ) : (
          <button
            onClick={handleToggle}
            disabled={isPending}
            className="rounded-[6px] border border-ink/15 px-3 py-1.5 text-sm text-ink/70 transition hover:border-terracotta hover:text-ink disabled:opacity-60"
          >
            Turn On
          </button>
        )}
      </div>
    </div>
  );
}
