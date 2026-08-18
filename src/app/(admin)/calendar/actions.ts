"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteCalendarEvent } from "@/lib/google";

export async function cancelBooking(bookingId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Not authenticated");

  const admin = supabaseAdmin();
  const { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!booking) return;

  if (booking.google_event_id) {
    await deleteCalendarEvent(user.id, booking.google_event_id);
  }

  await admin.from("bookings").update({ status: "canceled" }).eq("id", bookingId);
  revalidatePath("/calendar");
}
