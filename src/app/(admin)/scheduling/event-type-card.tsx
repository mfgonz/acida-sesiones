"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toggleEventTypeActive, deleteEventType } from "./actions";
import { LOCATION_LABELS, type EventType } from "@/lib/types";

export function EventTypeCard({
  eventType,
  bookingUrl,
  bookingPath,
}: {
  eventType: EventType;
  bookingUrl: string;
  bookingPath: string;
}) {
  const [isActive, setIsActive] = useState(eventType.is_active);
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

  function handleDelete() {
    if (!confirm(`¿Eliminar "${eventType.name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(() => deleteEventType(eventType.id));
  }

  return (
    <article className={`flex flex-col border border-ink bg-cream transition-opacity ${isActive ? "" : "opacity-60"}`}>
      <div className="h-2.5" style={{ background: eventType.color }} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-3.5 p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="lbl">
            {eventType.duration_minutes} min · {LOCATION_LABELS[eventType.location_type]}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label={`${isActive ? "Desactivar" : "Activar"} ${eventType.name}`}
            onClick={handleToggle}
            disabled={isPending}
            className={`relative h-7 w-12 shrink-0 rounded-full border border-ink p-0 transition-colors ${
              isActive ? "bg-ink" : "bg-bone"
            }`}
          >
            <span
              className={`absolute top-[3px] h-5 w-5 rounded-full transition-all ${
                isActive ? "left-[23px] bg-mustard" : "left-[3px] bg-ink"
              }`}
            />
          </button>
        </div>
        <h3 className="font-display text-[28px] font-normal leading-[34px] sm:text-[32px] sm:leading-[38px]">{eventType.name}</h3>
        <span className="lbl break-all text-indigo">{bookingPath}</span>
        {eventType.description && <p className="line-clamp-3 text-[13px] leading-[17px]">{eventType.description}</p>}
        <span className="mt-auto text-[13px] leading-[17px]">
          {isActive ? "Visible en la página pública" : "Oculta: no recibe reservas"}
        </span>
      </div>
      <div className="flex border-t border-ink">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!isActive}
          className="btn flex-1 rounded-none border-0 border-r border-ink"
        >
          {copied ? "Copiado" : "Copiar enlace"}
        </button>
        <Link href={`/scheduling/${eventType.id}/edit`} className="btn flex-1 rounded-none border-0 border-r border-ink">
          Editar
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`Eliminar ${eventType.name}`}
          className="btn w-12 rounded-none border-0 !px-0 hover:text-terracotta"
        >
          <Trash2 size={15} strokeWidth={1.5} />
        </button>
      </div>
    </article>
  );
}
