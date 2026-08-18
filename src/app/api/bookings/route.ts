import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes } from "date-fns";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getBusyIntervals, createCalendarEvent } from "@/lib/google";
import { computeAvailableSlots } from "@/lib/availability";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import type { AvailabilityRule, DateOverride } from "@/lib/types";

export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  username: z.string().min(1),
  slug: z.string().min(1),
  startTime: z.string().datetime(),
  inviteeName: z.string().min(1).max(200),
  inviteeEmail: z.string().email(),
  inviteeNotes: z.string().max(2000).optional().default(""),
  inviteeTimezone: z.string().min(1),
  // Honeypot: real users never see or fill this field.
  website: z.string().max(0).optional().default(""),
  // Timestamp (ms) the booking form was shown; bots that submit instantly get rejected.
  formShownAt: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { username, slug, startTime, inviteeName, inviteeEmail, inviteeNotes, inviteeTimezone, formShownAt } =
    parsed.data;

  // Silently accept-looking-but-drop honeypot/instant-submit hits instead of
  // telling the bot what tripped it.
  if (formShownAt && Date.now() - formShownAt < 1500) {
    return NextResponse.json({ error: "Please try again" }, { status: 400 });
  }

  const ip = clientIp(request);
  if (
    (await isRateLimited("booking:ip", ip, 8, 10)) ||
    (await isRateLimited("booking:email", inviteeEmail.toLowerCase(), 5, 60))
  ) {
    return NextResponse.json({ error: "Too many booking attempts. Please try again later." }, { status: 429 });
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
  if (!schedule) return NextResponse.json({ error: "No availability configured" }, { status: 409 });

  const requestedStart = new Date(startTime);
  const requestedEnd = addMinutes(requestedStart, eventType.duration_minutes);

  // Re-validate the slot is still open server-side (defends against stale UI / race conditions).
  const { data: rules } = await admin.from("availability_rules").select("*").eq("schedule_id", schedule.id);
  const { data: overrides } = await admin.from("date_overrides").select("*").eq("schedule_id", schedule.id);
  const { data: existingBookings } = await admin
    .from("bookings")
    .select("start_time, end_time")
    .eq("user_id", profile.id)
    .eq("status", "confirmed");

  const busyFromBookings = (existingBookings ?? []).map((b) => ({
    start: new Date(b.start_time),
    end: new Date(b.end_time),
  }));
  const googleBusy = await getBusyIntervals(
    profile.id,
    requestedStart.toISOString(),
    requestedEnd.toISOString()
  );
  const busyFromGoogle = googleBusy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));

  const validSlots = computeAvailableSlots({
    scheduleTz: schedule.timezone,
    rules: (rules ?? []) as AvailabilityRule[],
    overrides: (overrides ?? []) as DateOverride[],
    durationMinutes: eventType.duration_minutes,
    bufferBeforeMinutes: eventType.buffer_before_minutes,
    bufferAfterMinutes: eventType.buffer_after_minutes,
    minNoticeMinutes: eventType.min_notice_minutes,
    rangeStart: requestedStart,
    rangeEnd: requestedEnd,
    busyIntervals: [...busyFromBookings, ...busyFromGoogle],
  });

  const stillOpen = validSlots.some((s) => s.start.getTime() === requestedStart.getTime());
  if (!stillOpen) {
    return NextResponse.json({ error: "That time is no longer available" }, { status: 409 });
  }

  let googleEventId: string | null = null;
  let meetLink: string | null = null;
  try {
    const created = await createCalendarEvent({
      userId: profile.id,
      summary: `${eventType.name} with ${inviteeName}`,
      description: inviteeNotes || "",
      startTime: requestedStart.toISOString(),
      endTime: requestedEnd.toISOString(),
      attendeeEmail: inviteeEmail,
      attendeeName: inviteeName,
      useGoogleMeet: eventType.location_type === "google_meet",
      location: eventType.location_type !== "google_meet" ? eventType.location_details : undefined,
    });
    if (created) {
      googleEventId = created.googleEventId;
      meetLink = created.meetLink;
    }
  } catch (err) {
    console.error("Failed to create Google Calendar event", err);
    return NextResponse.json({ error: "Could not create calendar event" }, { status: 502 });
  }

  const { data: booking, error } = await admin
    .from("bookings")
    .insert({
      event_type_id: eventType.id,
      user_id: profile.id,
      invitee_name: inviteeName,
      invitee_email: inviteeEmail,
      invitee_notes: inviteeNotes,
      invitee_timezone: inviteeTimezone,
      start_time: requestedStart.toISOString(),
      end_time: requestedEnd.toISOString(),
      google_event_id: googleEventId,
      meet_link: meetLink,
    })
    .select("id, cancel_token")
    .single();

  if (error) {
    console.error("Failed to save booking", error);
    return NextResponse.json({ error: "Could not save booking" }, { status: 500 });
  }

  return NextResponse.json({ bookingId: booking.id, cancelToken: booking.cancel_token, meetLink });
}
