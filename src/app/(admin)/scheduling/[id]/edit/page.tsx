import { notFound } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateEventType } from "../../actions";
import { EventTypeForm } from "../../event-type-form";
import type { EventType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditEventTypePage({ params }: { params: { id: string } }) {
  const user = await getAuthUser();
  const admin = supabaseAdmin();

  const { data: eventType } = await admin
    .from("event_types")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!eventType) notFound();

  const updateWithId = updateEventType.bind(null, params.id);

  return (
    <div>
      <h2 className="mb-6 text-base font-semibold text-white">Edit event type</h2>
      <EventTypeForm action={updateWithId} eventType={eventType as EventType} />
    </div>
  );
}
