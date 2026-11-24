"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { rescheduleBooking } from "./actions";

export function RescheduleModal({
  bookingId,
  username,
  slug,
  onClose,
}: {
  bookingId: string;
  username: string;
  slug: string;
  onClose: () => void;
}) {
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    fetch(`/api/availability?username=${username}&slug=${slug}&month=${format(month, "yyyy-MM")}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoading(false));
  }, [month, username, slug]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const iso of slots) {
      const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date(iso));
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(iso);
    }
    return map;
  }, [slots, timezone]);

  const daysInMonth = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const numDays = new Date(year, m + 1, 0).getDate();
    const firstDayOffset = (new Date(year, m, 1).getDay() + 6) % 7;
    const days: (string | null)[] = Array(firstDayOffset).fill(null);
    for (let d = 1; d <= numDays; d++) days.push(format(new Date(year, m, d), "yyyy-MM-dd"));
    return days;
  }, [month]);

  function handleConfirm() {
    if (!selectedSlot) return;
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await rescheduleBooking(bookingId, selectedSlot);
        onClose();
      } catch (err) {
        setErrorMsg("Could not reschedule. Please try again.");
      }
    });
  }

  const selectedDaySlots = selectedDate ? slotsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg text-ink">Reschedule session</p>
          <button onClick={onClose} className="rounded-[6px] p-1.5 text-ink/50 hover:bg-ink/5 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-ink">{format(month, "MMMM yyyy")}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                  className="rounded-lg p-1.5 text-ink/50 hover:bg-cream hover:text-ink"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                  className="rounded-lg p-1.5 text-ink/50 hover:bg-cream hover:text-ink"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-label text-xs text-ink/40">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {daysInMonth.map((dateKey, i) => {
                if (!dateKey) return <div key={i} />;
                const hasSlots = (slotsByDate.get(dateKey)?.length ?? 0) > 0;
                const isSelected = selectedDate === dateKey;
                const dayNum = Number(dateKey.slice(-2));
                return (
                  <button
                    key={dateKey}
                    disabled={!hasSlots}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`group flex aspect-square flex-col items-center justify-center gap-1 text-sm transition ${
                      hasSlots ? "text-ink" : "text-ink/25"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                        isSelected ? "bg-terracotta text-cream" : hasSlots ? "group-hover:bg-cream" : ""
                      }`}
                    >
                      {dayNum}
                    </span>
                    {hasSlots && <span className="h-1.5 w-1.5 rounded-full bg-terracotta" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            {loading && <p className="mt-3 text-xs text-ink/40">Loading availability…</p>}
          </div>

          <div>
            <p className="mb-3 text-sm text-ink/60">
              {selectedDate
                ? new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    timeZone: timezone,
                  }).format(new Date(`${selectedDate}T12:00:00`))
                : "Select a day"}
            </p>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {selectedDaySlots.map((iso) => (
                <button
                  key={iso}
                  onClick={() => setSelectedSlot(iso)}
                  className={`block w-full rounded-[6px] border py-2 text-sm transition ${
                    selectedSlot === iso
                      ? "border-terracotta bg-terracotta/10 text-ink"
                      : "border-ink/15 text-ink hover:border-terracotta hover:bg-terracotta/10"
                  }`}
                >
                  {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(
                    new Date(iso)
                  )}
                </button>
              ))}
              {selectedDate && !selectedDaySlots.length && (
                <p className="text-sm text-ink/40">No times available this day.</p>
              )}
            </div>
            <p className="mt-3 text-xs text-ink/40">Times shown in {timezone}</p>
          </div>
        </div>

        {errorMsg && <p className="mt-4 text-sm text-red-600">{errorMsg}</p>}

        <div className="mt-6 flex justify-end gap-2 border-t border-ink/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-[6px] border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:border-terracotta hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSlot || isPending}
            className="flex items-center gap-2 rounded-[6px] bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:bg-terracotta disabled:opacity-60"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Confirm new time
          </button>
        </div>
      </div>
    </div>
  );
}
