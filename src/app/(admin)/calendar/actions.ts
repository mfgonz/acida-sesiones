"use server";

import { revalidatePath } from "next/cache";
import { addMinutes } from "date-fns";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteCalendarEvent, updateCalendarEventTime } from "@/lib/google";
import { sendAdminBookingUpdate, sendBookingCancellation, sendBookingReschedule } from "@/lib/email";

export async function cancelBooking(bookingId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Not authenticated");

  const admin = supabaseAdmin();
  const { data: booking } = await admin
    .from("bookings")
    .select("*, event_types(name)")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!booking || booking.status === "canceled") return;

  if (booking.google_event_id) {
    await deleteCalendarEvent(user.id, booking.google_event_id);
  }

  await admin.from("bookings").update({ status: "canceled" }).eq("id", bookingId);

  const eventTypeName = booking.event_types?.name ?? "Sesión";
  const startTime = new Date(booking.start_time);
  await Promise.all([
    sendBookingCancellation({
      eventTypeName,
      inviteeEmail: booking.invitee_email,
      inviteeTimezone: booking.invitee_timezone,
      startTime,
    }),
    sendAdminBookingUpdate({
      action: "canceled",
      actor: "admin",
      eventTypeName,
      inviteeName: booking.invitee_name,
      inviteeEmail: booking.invitee_email,
      inviteePhone: booking.invitee_phone,
      timezone: booking.invitee_timezone,
      startTime,
    }),
  ]);

  revalidatePath("/calendar");
}

export async function rescheduleBooking(bookingId: string, newStartTimeIso: string, reasonInput?: string) {
  const reason = reasonInput?.trim().slice(0, 500) || null;
  const user = await getAuthUser();
  if (!user) throw new Error("Not authenticated");

  const admin = supabaseAdmin();
  const { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!booking) throw new Error("Booking not found");

  const { data: eventType } = await admin
    .from("event_types")
    .select("*")
    .eq("id", booking.event_type_id)
    .maybeSingle();
  if (!eventType) throw new Error("Event type not found");

  const previousStart = new Date(booking.start_time);
  const newStart = new Date(newStartTimeIso);
  const newEnd = addMinutes(newStart, eventType.duration_minutes);

  if (booking.google_event_id) {
    await updateCalendarEventTime(user.id, booking.google_event_id, newStart.toISOString(), newEnd.toISOString());
  }

  await admin
    .from("bookings")
    .update({ start_time: newStart.toISOString(), end_time: newEnd.toISOString() })
    .eq("id", bookingId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  await Promise.all([
    sendBookingReschedule({
      eventTypeName: eventType.name,
      inviteeEmail: booking.invitee_email,
      inviteeTimezone: booking.invitee_timezone,
      startTime: newStart,
      endTime: newEnd,
      meetLink: booking.meet_link,
      locationDetails: eventType.location_type !== "google_meet" ? eventType.location_details : null,
      cancelUrl: `${appUrl}/cancel/${booking.cancel_token}`,
      reason,
    }),
    sendAdminBookingUpdate({
      action: "rescheduled",
      actor: "admin",
      eventTypeName: eventType.name,
      inviteeName: booking.invitee_name,
      inviteeEmail: booking.invitee_email,
      inviteePhone: booking.invitee_phone,
      timezone: booking.invitee_timezone,
      startTime: newStart,
      previousStartTime: previousStart,
      reason,
    }),
  ]);

  revalidatePath("/calendar");
}
