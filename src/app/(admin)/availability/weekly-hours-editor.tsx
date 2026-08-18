"use client";

import { useState } from "react";
import { WEEKDAY_LABELS } from "@/lib/types";
import type { AvailabilityRule } from "@/lib/types";

const COMMON_TIMEZONES = [
  "America/Mexico_City",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Bogota",
  "America/Sao_Paulo",
  "Europe/Madrid",
  "Europe/London",
  "UTC",
];

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
  );
  const [days, setDays] = useState(initial);

  function update(day: number, patch: Partial<(typeof initial)[number]>) {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
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

      <div className="space-y-2">
        {WEEKDAY_LABELS.map((label, day) => (
          <div key={day} className="flex items-center gap-3 rounded-lg border border-base-700 px-3 py-2">
            <label className="flex w-32 items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                name={`day_${day}_enabled`}
                checked={days[day].enabled}
                onChange={(e) => update(day, { enabled: e.target.checked })}
                className="h-4 w-4 rounded border-base-600 bg-base-850"
              />
              {label}
            </label>
            {days[day].enabled ? (
              <div className="flex items-center gap-2">
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
