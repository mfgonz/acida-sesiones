import { NextRequest, NextResponse } from "next/server";
import { addDays, endOfMonth, startOfMonth } from "date-fns";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getBusyIntervals } from "@/lib/google";
import { computeAvailableSlots } from "@/lib/availability";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import type { AvailabilityRule, DateOverride } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const username = searchParams.get("username");
  const slug = searchParams.get("slug");
  const month = searchParams.get("month"); // YYYY-MM

  if (!username || !slug || !month) {
    return NextResponse.json({ error: "Missing username, slug, or month" }, { status: 400 });
  }

  if (await isRateLimited("availability:ip", clientIp(request), 60, 10)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const admin = supabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, timezone")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: eventType } = await admin
    .from("event_types")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!eventType) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: schedule } = eventType.schedule_id
    ? await admin.from("availability_schedules").select("*").eq("id", eventType.schedule_id).maybeSingle()
    : { data: null };
  if (!schedule) return NextResponse.json({ slots: [] });

  const { data: rules } = await admin
    .from("availability_rules")
    .select("*")
    .eq("schedule_id", schedule.id);
  const { data: overrides } = await admin
    .from("date_overrides")
    .select("*")
    .eq("schedule_id", schedule.id);

  const [year, monthNum] = month.split("-").map(Number);
  const monthStart = startOfMonth(new Date(year, monthNum - 1, 1));
  const monthEnd = endOfMonth(monthStart);

  const horizonEnd = addDays(new Date(), eventType.booking_horizon_days);
  const rangeStart = monthStart;
  const rangeEnd = monthEnd < horizonEnd ? monthEnd : horizonEnd;

  const { data: existingBookings } = await admin
    .from("bookings")
    .select("start_time, end_time")
    .eq("user_id", profile.id)
    .eq("status", "confirmed")
    .gte("start_time", rangeStart.toISOString())
    .lte("start_time", rangeEnd.toISOString());

  const busyFromBookings = (existingBookings ?? []).map((b) => ({
    start: new Date(b.start_time),
    end: new Date(b.end_time),
  }));

  const googleBusy = await getBusyIntervals(profile.id, rangeStart.toISOString(), rangeEnd.toISOString());
  const busyFromGoogle = googleBusy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));

  const slots = computeAvailableSlots({
    scheduleTz: schedule.timezone,
    rules: (rules ?? []) as AvailabilityRule[],
    overrides: (overrides ?? []) as DateOverride[],
    durationMinutes: eventType.duration_minutes,
    bufferBeforeMinutes: eventType.buffer_before_minutes,
    bufferAfterMinutes: eventType.buffer_after_minutes,
    minNoticeMinutes: eventType.min_notice_minutes,
    rangeStart,
    rangeEnd,
    busyIntervals: [...busyFromBookings, ...busyFromGoogle],
  });

  return NextResponse.json({
    timezone: schedule.timezone,
    slots: slots.map((s) => s.start.toISOString()),
  });
}
