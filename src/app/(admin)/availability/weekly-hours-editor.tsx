"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { WEEKDAY_LABELS } from "@/lib/types";
import type { AvailabilityRule } from "@/lib/types";

const COMMON_TIMEZONES = [
  "America/Mexico_City",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Bogota",
  "America/Panama",
  "America/Sao_Paulo",
  "Europe/Madrid",
  "Europe/London",
  "UTC",
];

// Display Monday first; day_of_week values themselves stay 0=Sunday..6=Saturday
// to match the database convention used everywhere else.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type DayState = { enabled: boolean; start: string; end: string };

export function WeeklyHoursEditor({
  action,
  rules,
  timezone,
}: {
  action: (formData: FormData) => void;
  rules: AvailabilityRule[];
  timezone: string;
}) {
  const initial = Object.fromEntries(
    Array.from({ length: 7 }, (_, day) => {
      const rule = rules.find((r) => r.day_of_week === day);
      return [day, rule ? { enabled: true, start: rule.start_time.slice(0, 5), end: rule.end_time.slice(0, 5) } : { enabled: false, start: "09:00", end: "17:00" }];
    })
  ) as Record<number, DayState>;
  const [days, setDays] = useState(initial);

  function update(day: number, patch: Partial<DayState>) {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  function applyToAllEnabled(source: number) {
    const { start, end } = days[source];
    setDays((prev) => {
      const next = { ...prev };
      for (const day of DISPLAY_ORDER) {
        if (next[day].enabled) next[day] = { ...next[day], start, end };
      }
      return next;
    });
  }

  function setAll(patch: Partial<DayState>) {
    setDays((prev) => {
      const next = { ...prev };
      for (const day of DISPLAY_ORDER) next[day] = { ...next[day], ...patch };
      return next;
    });
  }

  function setWeekdaysOnly() {
    setDays((prev) => {
      const next = { ...prev };
      for (const day of DISPLAY_ORDER) next[day] = { ...next[day], enabled: day >= 1 && day <= 5 };
      return next;
    });
  }

  return (
    <form action={action} className="max-w-xl space-y-5">
      <div>
        <label className="mb-1 block text-sm text-neutral-300">Timezone</label>
        <select
          name="timezone"
          defaultValue={timezone}
          className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={setWeekdaysOnly}
          className="rounded-lg border border-base-600 px-3 py-1.5 text-neutral-300 hover:border-base-500 hover:text-white"
        >
          Weekdays only
        </button>
        <button
          type="button"
          onClick={() => setAll({ enabled: true })}
          className="rounded-lg border border-base-600 px-3 py-1.5 text-neutral-300 hover:border-base-500 hover:text-white"
        >
          Mark all available
        </button>
        <button
          type="button"
          onClick={() => setAll({ enabled: false })}
          className="rounded-lg border border-base-600 px-3 py-1.5 text-neutral-300 hover:border-base-500 hover:text-white"
        >
          Mark all unavailable
        </button>
      </div>

      <div className="space-y-2">
        {DISPLAY_ORDER.map((day) => (
          <div key={day} className="flex items-center gap-3 rounded-lg border border-base-700 px-3 py-2">
            <label className="flex w-32 items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                name={`day_${day}_enabled`}
                checked={days[day].enabled}
                onChange={(e) => update(day, { enabled: e.target.checked })}
                className="h-4 w-4 rounded border-base-600 bg-base-850"
              />
              {WEEKDAY_LABELS[day]}
            </label>
            {days[day].enabled ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="time"
                  name={`day_${day}_start`}
                  value={days[day].start}
                  onChange={(e) => update(day, { start: e.target.value })}
                  className="rounded-lg border border-base-600 bg-base-850 px-2 py-1 text-sm text-white outline-none focus:border-accent"
                />
                <span className="text-neutral-500">–</span>
                <input
                  type="time"
                  name={`day_${day}_end`}
                  value={days[day].end}
                  onChange={(e) => update(day, { end: e.target.value })}
                  className="rounded-lg border border-base-600 bg-base-850 px-2 py-1 text-sm text-white outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => applyToAllEnabled(day)}
                  title="Copy this time to every available day"
                  className="ml-auto rounded-lg p-1.5 text-neutral-500 hover:bg-base-850 hover:text-white"
                >
                  <Copy size={14} />
                </button>
              </div>
            ) : (
              <span className="text-sm text-neutral-500">Unavailable</span>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
      >
        Save hours
      </button>
    </form>
  );
}
