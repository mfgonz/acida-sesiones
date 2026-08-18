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
      className={`flex items-center justify-between rounded-lg border-l-4 bg-base-900 px-5 py-4 ${
        isActive ? "border-l-accent-purple" : "border-l-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: eventType.color }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-white">{eventType.name}</p>
          <p className="mt-0.5 text-sm text-neutral-400">
            {eventType.duration_minutes} min · {LOCATION_LABELS[eventType.location_type]} · One-on-One
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isActive ? (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-base-600 px-3 py-1.5 text-sm text-neutral-200 hover:border-base-500"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy link"}
          </button>
        ) : (
          <button
            onClick={handleToggle}
            disabled={isPending}
            className="rounded-lg border border-base-600 px-3 py-1.5 text-sm text-neutral-200 hover:border-base-500 disabled:opacity-60"
          >
            Turn On
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-neutral-400 hover:bg-base-850 hover:text-white"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-base-700 bg-base-850 py-1 shadow-lg"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                href={`/scheduling/${eventType.id}/edit`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-base-800"
              >
                <Pencil size={14} /> Edit
              </Link>
              {isActive && (
                <button
                  onClick={handleToggle}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-base-800"
                >
                  Turn Off
                </button>
              )}
              <button
                onClick={() => startTransition(() => deleteEventType(eventType.id))}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-base-800"
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
