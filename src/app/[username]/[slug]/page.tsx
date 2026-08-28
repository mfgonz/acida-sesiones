import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BookingWidget } from "@/components/booking-widget";
import { PublicFooter } from "@/components/public-footer";
import { BRAND_NAME } from "@/lib/brand";
import { LOCATION_LABELS, type EventType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: { params: { username: string; slug: string } }) {
  const admin = supabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, username")
    .eq("username", params.username)
    .maybeSingle();
  if (!profile) notFound();

  const { data: eventTypeRow } = await admin
    .from("event_types")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", params.slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!eventTypeRow) notFound();
  const eventType = eventTypeRow as EventType;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href={`/${profile.username}`}
          className="mb-6 inline-flex items-center gap-1.5 font-label text-xs uppercase tracking-wide text-ink/60 transition hover:text-terracotta"
        >
          <ArrowLeft size={15} /> All session types
        </Link>

        <div className="mb-8">
          <p className="font-label text-xs uppercase tracking-wide text-ink/50">{BRAND_NAME}</p>
          <h1 className="mt-1 font-display text-2xl font-black text-ink">{eventType.name}</h1>
          <p className="mt-2 font-label text-xs uppercase tracking-wide text-ink/50">
            {eventType.duration_minutes} min · {LOCATION_LABELS[eventType.location_type]}
          </p>
          {eventType.description && <p className="mt-3 max-w-xl text-ink/70">{eventType.description}</p>}
        </div>

        <BookingWidget username={profile.username} slug={eventType.slug} durationMinutes={eventType.duration_minutes} />

        <PublicFooter />
      </div>
    </div>
  );
}
