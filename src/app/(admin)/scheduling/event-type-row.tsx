"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, MoreVertical, Trash2, Pencil, Check } from "lucide-react";
import { toggleEventTypeActive, deleteEventType } from "./actions";
import { LOCATION_LABELS, type EventType } from "@/lib/types";

export function EventTypeRow({ eventType, bookingUrl }: { eventType: EventType; bookingUrl: string }) {
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
      className={`flex items-center justify-between rounded-lg border-l-4 border border-ink/10 bg-white/60 px-5 py-4 ${
        isActive ? "border-l-terracotta" : "border-l-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: eventType.color }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-ink">{eventType.name}</p>
          <p className="mt-0.5 text-sm text-ink/60">
            {eventType.duration_minutes} min · {LOCATION_LABELS[eventType.location_type]} · One-on-One
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isActive ? (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-1.5 text-sm text-ink/70 transition hover:border-terracotta hover:text-ink"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy link"}
          </button>
        ) : (
          <button
            onClick={handleToggle}
            disabled={isPending}
            className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm text-ink/70 transition hover:border-terracotta hover:text-ink disabled:opacity-60"
          >
            Turn On
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-ink/60 transition hover:bg-ink/5 hover:text-ink"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-ink/10 bg-white py-1 shadow-lg"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                href={`/scheduling/${eventType.id}/edit`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink/70 hover:bg-ink/5"
              >
                <Pencil size={14} /> Edit
              </Link>
              {isActive && (
                <button
                  onClick={handleToggle}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink/70 hover:bg-ink/5"
                >
                  Turn Off
                </button>
              )}
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
    </div>
  );
}
