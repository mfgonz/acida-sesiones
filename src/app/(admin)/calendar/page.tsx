import { getAuthUser } from "@/lib/supabase/server-auth";
import { getOrCreateProfile } from "@/lib/profile";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BookingRow } from "./booking-row";
import type { Booking, EventType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getAuthUser();
  const profile = await getOrCreateProfile(user!);
  const admin = supabaseAdmin();

  const { data: bookings } = await admin
    .from("bookings")
    .select("*")
    .eq("user_id", profile.id)
    .eq("status", "confirmed")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  const { data: eventTypes } = await admin.from("event_types").select("*").eq("user_id", profile.id);
  const eventTypeMap = new Map((eventTypes as EventType[] | null)?.map((e) => [e.id, e]));

  return (
    <div>
      <p className="mb-6 text-sm text-ink/60">Upcoming confirmed sessions.</p>
      {!bookings?.length ? (
        <div className="rounded-xl border border-dashed border-ink/20 py-16 text-center text-ink/60">
          No upcoming bookings yet.
        </div>
      ) : (
        <div className="space-y-3">
          {(bookings as Booking[]).map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              eventType={eventTypeMap.get(booking.event_type_id)}
              timezone={profile.timezone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
