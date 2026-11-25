import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteCalendarEvent } from "@/lib/google";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { sendAdminBookingUpdate, sendBookingCancellation } from "@/lib/email";

export const dynamic = "force-dynamic";

const schema = z.object({ token: z.string().uuid() });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if (await isRateLimited("cancel:ip", clientIp(request), 15, 10)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const admin = supabaseAdmin();
  const { data: booking } = await admin
    .from("bookings")
    .select("*, event_types(name)")
    .eq("cancel_token", parsed.data.token)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.status === "canceled") return NextResponse.json({ ok: true });

  if (booking.google_event_id) {
    await deleteCalendarEvent(booking.user_id, booking.google_event_id);
  }

  await admin.from("bookings").update({ status: "canceled" }).eq("id", booking.id);

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
      actor: "client",
      eventTypeName,
      inviteeName: booking.invitee_name,
      inviteeEmail: booking.invitee_email,
      inviteePhone: booking.invitee_phone,
      timezone: booking.invitee_timezone,
      startTime,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
