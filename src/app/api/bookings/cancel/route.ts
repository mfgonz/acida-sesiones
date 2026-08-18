import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteCalendarEvent } from "@/lib/google";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

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
    .select("*")
    .eq("cancel_token", parsed.data.token)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.status === "canceled") return NextResponse.json({ ok: true });

  if (booking.google_event_id) {
    await deleteCalendarEvent(booking.user_id, booking.google_event_id);
  }

  await admin.from("bookings").update({ status: "canceled" }).eq("id", booking.id);
  return NextResponse.json({ ok: true });
}
