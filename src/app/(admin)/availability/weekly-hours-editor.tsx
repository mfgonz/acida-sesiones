"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { ReactNode } from "react";
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
  children,
}: {
  action: (formData: FormData) => void;
  rules: AvailabilityRule[];
  timezone: string;
  /** Extra panels for the right-hand column (e.g. the Google Calendar card). */
  children?: ReactNode;
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
    <div className="flex flex-wrap gap-9">
      <form id="hours-form" action={action} aria-labelledby="h-semana" className="flex min-w-0 flex-[3_1_480px] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-3">
          <h2 id="h-semana" className="font-display text-[32px] font-normal leading-[38px]">
            Horario semanal
          </h2>
          <label className="flex items-center gap-2">
            <span className="lbl">Zona</span>
            <select name="timezone" defaultValue={timezone} className="fld fld-sm !text-base">
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
        </div>

        {DISPLAY_ORDER.map((day) => (
          <div key={day} className="flex flex-wrap items-center gap-[18px] border-b border-ink py-3.5">
            <label className="flex min-h-[44px] w-40 items-center gap-3">
              <input
                type="checkbox"
                name={`day_${day}_enabled`}
                checked={days[day].enabled}
                onChange={(e) => update(day, { enabled: e.target.checked })}
                className="m-0 h-5 w-5 accent-ink"
              />
              <span className="text-lg leading-[25px]">{WEEKDAY_LABELS[day]}</span>
            </label>
            {days[day].enabled ? (
              <div className="flex flex-[1_1_280px] flex-wrap items-center gap-2">
                <input
                  type="time"
                  name={`day_${day}_start`}
                  value={days[day].start}
                  onChange={(e) => update(day, { start: e.target.value })}
                  aria-label={`${WEEKDAY_LABELS[day]}: desde`}
                  className="fld fld-sm"
                />
                <span className="lbl">a</span>
                <input
                  type="time"
                  name={`day_${day}_end`}
                  value={days[day].end}
                  onChange={(e) => update(day, { end: e.target.value })}
                  aria-label={`${WEEKDAY_LABELS[day]}: hasta`}
                  className="fld fld-sm"
                />
                <button
                  type="button"
                  onClick={() => applyToAllEnabled(day)}
                  title="Copiar este horario a todos los días disponibles"
                  aria-label="Copiar este horario a todos los días disponibles"
                  className="btn w-11 !px-0"
                >
                  <Copy size={14} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <span className="lbl flex-[1_1_280px]">No disponible</span>
            )}
          </div>
        ))}

        <div className="pt-6">
          <button type="submit" className="btn btn-ink btn-lg">
            Guardar horario
          </button>
        </div>
      </form>

      <div className="flex flex-[2_1_320px] flex-col gap-[18px]">
        <section aria-labelledby="h-atajos" className="flex flex-col gap-3.5 bg-blush p-6">
          <span className="lbl">[ Atajos ]</span>
          <h2 id="h-atajos" className="font-display text-[32px] font-normal leading-[38px]">
            Aplicar rápido
          </h2>
          <div className="flex flex-col gap-2 border-t border-ink pt-3.5">
            <button type="button" onClick={setWeekdaysOnly} className="btn justify-start">
              Solo lunes a viernes
            </button>
            <button type="button" onClick={() => setAll({ enabled: true })} className="btn justify-start">
              Marcar todos disponibles
            </button>
            <button type="button" onClick={() => setAll({ enabled: false })} className="btn justify-start">
              Marcar todos no disponibles
            </button>
          </div>
          <p className="text-[13px] leading-[17px]">Recuerda guardar el horario después de aplicar un atajo.</p>
        </section>
        {children}
      </div>
    </div>
  );
}
