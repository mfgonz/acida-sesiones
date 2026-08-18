"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addMonths, format, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Props {
  username: string;
  slug: string;
  durationMinutes: number;
}

type Step = "pick" | "form" | "done";

export function BookingWidget({ username, slug, durationMinutes }: Props) {
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ meetLink: string | null; cancelToken: string } | null>(null);
  const [formShownAt, setFormShownAt] = useState<number | null>(null);

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
    // getDay() is 0=Sunday..6=Saturday; shift so the grid starts on Monday.
    const firstDayOffset = (new Date(year, m, 1).getDay() + 6) % 7;
    const days: (string | null)[] = Array(firstDayOffset).fill(null);
    for (let d = 1; d <= numDays; d++) {
      days.push(format(new Date(year, m, d), "yyyy-MM-dd"));
    }
    return days;
  }, [month]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        slug,
        startTime: selectedSlot,
        inviteeName: formData.get("name"),
        inviteeEmail: formData.get("email"),
        inviteeNotes: formData.get("notes") ?? "",
        inviteeTimezone: timezone,
        website: formData.get("website") ?? "",
        formShownAt,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setErrorMsg(data.error ?? "Something went wrong. Please try another time.");
      return;
    }

    setConfirmation({ meetLink: data.meetLink ?? null, cancelToken: data.cancelToken });
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="rounded-xl border border-base-700 bg-base-900 p-8 text-center">
        <h2 className="text-lg font-semibold text-white">You&apos;re booked!</h2>
        <p className="mt-2 text-sm text-neutral-400">
          A calendar invite is on its way to your email
          {selectedSlot && (
            <>
              {" "}
              for{" "}
              {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: timezone,
              }).format(new Date(selectedSlot))}
            </>
          )}
          .
        </p>
        {confirmation?.meetLink && (
          <a href={confirmation.meetLink} target="_blank" className="mt-4 block text-accent hover:underline">
            {confirmation.meetLink}
          </a>
        )}
        {confirmation && (
          <a href={`/cancel/${confirmation.cancelToken}`} className="mt-4 block text-xs text-neutral-500 hover:text-neutral-300">
            Need to cancel?
          </a>
        )}
        <Link href={`/${username}`} className="mt-6 inline-block text-sm text-accent hover:underline">
          Book another session
        </Link>
      </div>
    );
  }

  if (step === "form" && selectedSlot) {
    return (
      <div className="rounded-xl border border-base-700 bg-base-900 p-6">
        <button onClick={() => setStep("pick")} className="mb-4 flex items-center gap-1 text-sm text-neutral-400 hover:text-white">
          <ChevronLeft size={16} /> Back
        </button>
        <p className="mb-1 text-sm text-neutral-400">{durationMinutes} min</p>
        <p className="mb-6 font-medium text-white">
          {new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
            timeZone: timezone,
          }).format(new Date(selectedSlot))}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot: hidden from real users, often auto-filled by bots. */}
          <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Leave this field empty</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Name</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Notes (optional)</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Confirm booking
          </button>
        </form>
      </div>
    );
  }

  const selectedDaySlots = selectedDate ? slotsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="grid gap-6 rounded-xl border border-base-700 bg-base-900 p-6 sm:grid-cols-2">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium text-white">{format(month, "MMMM yyyy")}</p>
          <div className="flex gap-1">
            <button
              onClick={() => setMonth((m) => addMonths(m, -1))}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-base-850 hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-base-850 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500">
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
                className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition ${
                  isSelected
                    ? "bg-accent text-white"
                    : hasSlots
                    ? "text-white hover:bg-base-850"
                    : "text-neutral-700"
                }`}
              >
                {dayNum}
                {hasSlots && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-accent"}`}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
        {loading && <p className="mt-3 text-xs text-neutral-500">Loading availability…</p>}
      </div>

      <div>
        <p className="mb-3 text-sm text-neutral-400">
          {selectedDate
            ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: timezone }).format(
                new Date(`${selectedDate}T12:00:00`)
              )
            : "Select a day"}
        </p>
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {selectedDaySlots.map((iso) => (
            <button
              key={iso}
              onClick={() => {
                setSelectedSlot(iso);
                setFormShownAt(Date.now());
                setStep("form");
              }}
              className="block w-full rounded-lg border border-base-600 py-2 text-sm text-white hover:border-accent hover:bg-accent/10"
            >
              {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(
                new Date(iso)
              )}
            </button>
          ))}
          {selectedDate && !selectedDaySlots.length && (
            <p className="text-sm text-neutral-500">No times available this day.</p>
          )}
        </div>
        <p className="mt-3 text-xs text-neutral-500">Times shown in {timezone}</p>
      </div>
    </div>
  );
}
