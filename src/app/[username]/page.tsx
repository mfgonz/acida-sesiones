import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LOCATION_LABELS, type EventType } from "@/lib/types";

export default async function PublicLandingPage({ params }: { params: { username: string } }) {
  const admin = supabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, username, full_name")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) notFound();

  const { data: eventTypes } = await admin
    .from("event_types")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-16">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-lg font-semibold text-white">
          {profile.full_name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">{profile.full_name}</h1>
          <p className="text-sm text-neutral-400">@{profile.username}</p>
        </div>
      </div>

      <div className="space-y-3">
        {!eventTypes?.length ? (
          <p className="text-neutral-400">No sessions are open for booking right now.</p>
        ) : (
          (eventTypes as EventType[]).map((eventType) => (
            <Link
              key={eventType.id}
              href={`/${profile.username}/${eventType.slug}`}
              className="block rounded-xl border border-base-700 bg-base-900 px-6 py-5 transition hover:border-accent"
            >
              <p className="font-medium text-white">{eventType.name}</p>
              <p className="mt-1 text-sm text-neutral-400">
                {eventType.duration_minutes} min · {LOCATION_LABELS[eventType.location_type]}
              </p>
              {eventType.description && (
                <p className="mt-2 text-sm text-neutral-500">{eventType.description}</p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
