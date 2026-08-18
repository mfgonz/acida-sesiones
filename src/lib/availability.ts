import { addMinutes, isBefore } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import type { AvailabilityRule, DateOverride } from "@/lib/types";

export interface Interval {
  start: Date;
  end: Date;
}

const SLOT_STEP_MINUTES = 15;

/** yyyy-MM-dd for a UTC instant, as seen in the given IANA timezone. */
function dateStrInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}

/** Adds days to a yyyy-MM-dd string using UTC-only arithmetic (never touches the runtime's local timezone). */
function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday .. 6 = Saturday, derived purely from the Y-M-D triple (no timezone conversion needed — dateStr already represents the calendar day in the schedule's timezone). */
function dayOfWeekForDateStr(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

/** Candidate slot start times (UTC Dates) for a single calendar day (given as a yyyy-MM-dd string in the schedule's timezone). */
function generateDaySlots(
  dateStr: string,
  scheduleTz: string,
  rules: AvailabilityRule[],
  overrides: DateOverride[],
  durationMinutes: number
): Interval[] {
  const override = overrides.find((o) => o.date === dateStr);

  let windows: { start: string; end: string }[];
  if (override) {
    if (!override.is_available || !override.start_time || !override.end_time) return [];
    windows = [{ start: override.start_time, end: override.end_time }];
  } else {
    const dayOfWeek = dayOfWeekForDateStr(dateStr);
    windows = rules
      .filter((r) => r.day_of_week === dayOfWeek)
      .map((r) => ({ start: r.start_time, end: r.end_time }));
  }

  const slots: Interval[] = [];
  const step = Math.min(SLOT_STEP_MINUTES, durationMinutes);

  for (const window of windows) {
    const windowStartUtc = fromZonedTime(`${dateStr}T${window.start}`, scheduleTz);
    const windowEndUtc = fromZonedTime(`${dateStr}T${window.end}`, scheduleTz);

    let cursor = windowStartUtc;
    while (isBefore(addMinutes(cursor, durationMinutes), addMinutes(windowEndUtc, 1))) {
      slots.push({ start: cursor, end: addMinutes(cursor, durationMinutes) });
      cursor = addMinutes(cursor, step);
    }
  }

  return slots;
}

function overlaps(a: Interval, b: Interval): boolean {
  return isBefore(a.start, b.end) && isBefore(b.start, a.end);
}

export interface ComputeSlotsParams {
  scheduleTz: string;
  rules: AvailabilityRule[];
  overrides: DateOverride[];
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minNoticeMinutes: number;
  rangeStart: Date;
  rangeEnd: Date;
  busyIntervals: Interval[];
}

/** Generates all open slots in [rangeStart, rangeEnd), already filtered against busy intervals, notice, and buffers. */
export function computeAvailableSlots(params: ComputeSlotsParams): Interval[] {
  const {
    scheduleTz,
    rules,
    overrides,
    durationMinutes,
    bufferBeforeMinutes,
    bufferAfterMinutes,
    minNoticeMinutes,
    rangeStart,
    rangeEnd,
    busyIntervals,
  } = params;

  const earliestStart = addMinutes(new Date(), minNoticeMinutes);
  const slots: Interval[] = [];

  let dateStr = dateStrInTz(rangeStart, scheduleTz);
  const lastDateStr = dateStrInTz(rangeEnd, scheduleTz);

  while (dateStr <= lastDateStr) {
    const daySlots = generateDaySlots(dateStr, scheduleTz, rules, overrides, durationMinutes);

    for (const slot of daySlots) {
      if (isBefore(slot.start, earliestStart)) continue;
      if (isBefore(rangeEnd, slot.end) || isBefore(slot.start, rangeStart)) continue;

      const bufferedSlot: Interval = {
        start: addMinutes(slot.start, -bufferBeforeMinutes),
        end: addMinutes(slot.end, bufferAfterMinutes),
      };
      const blocked = busyIntervals.some((busy) => overlaps(bufferedSlot, busy));
      if (!blocked) slots.push(slot);
    }

    dateStr = addDaysToDateStr(dateStr, 1);
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}
