import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PublicFooter } from "@/components/public-footer";
import { LocationIcon } from "@/components/location-icon";
import { BRAND_NAME, BRAND_HANDLE, BRAND_DESCRIPTION } from "@/lib/brand";
import { LOCATION_LABELS, type EventType } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-black tracking-tight text-ink">
            {BRAND_NAME.toLowerCase()}
            <span className="ml-2 font-label text-sm font-normal tracking-normal text-ink/50">
              {BRAND_HANDLE}
            </span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-ink/70">{BRAND_DESCRIPTION}</p>
        </div>

        <div className="space-y-3">
          {!eventTypes?.length ? (
            <p className="text-ink/60">No sessions are open for booking right now.</p>
          ) : (
            (eventTypes as EventType[]).map((eventType) => (
              <Link
                key={eventType.id}
                href={`/${profile.username}/${eventType.slug}`}
                className="flex items-start gap-4 rounded-xl border border-ink/10 bg-white/60 px-6 py-5 transition hover:border-terracotta hover:bg-white"
              >
                <LocationIcon locationType={eventType.location_type} color={eventType.color} />
                <div>
                  <p className="font-display font-bold text-ink">{eventType.name}</p>
                  <p className="mt-1 font-label text-xs uppercase tracking-wide text-ink/50">
                    {eventType.duration_minutes} min · {LOCATION_LABELS[eventType.location_type]}
                  </p>
                  {eventType.description && (
                    <p className="mt-2 text-sm text-ink/70">{eventType.description}</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}
