import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BookingWidget } from "@/components/booking-widget";
import { LOCATION_LABELS, type EventType } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

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
    <BookingWidget
      username={profile.username}
      slug={eventType.slug}
      eventName={eventType.name}
      description={eventType.description}
      locationLabel={LOCATION_LABELS[eventType.location_type]}
      audience={eventType.audience}
      durationMinutes={eventType.duration_minutes}
      collectProjectDetails={eventType.collect_project_details}
    />
  );
}
