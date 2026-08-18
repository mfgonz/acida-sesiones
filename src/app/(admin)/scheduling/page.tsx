import Link from "next/link";
import { Plus } from "lucide-react";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { getOrCreateProfile } from "@/lib/profile";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EventTypeRow } from "./event-type-row";
import type { EventType } from "@/lib/types";

export default async function SchedulingPage() {
  const user = await getAuthUser();
  const profile = await getOrCreateProfile(user!);
  const admin = supabaseAdmin();

  const { data: eventTypes } = await admin
    .from("event_types")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: true });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-400">Event types</p>
        </div>
        <Link
          href="/scheduling/new"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          <Plus size={16} /> Create
        </Link>
      </div>

      {!eventTypes?.length ? (
        <div className="rounded-xl border border-dashed border-base-700 py-16 text-center text-neutral-400">
          No event types yet. Create your first one to start accepting bookings.
        </div>
      ) : (
        <div className="space-y-3">
          {(eventTypes as EventType[]).map((eventType) => (
            <EventTypeRow
              key={eventType.id}
              eventType={eventType}
              bookingUrl={`${appUrl}/${profile.username}/${eventType.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
