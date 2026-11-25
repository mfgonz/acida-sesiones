import { getAuthUser } from "@/lib/supabase/server-auth";
import { getOrCreateProfile } from "@/lib/profile";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin-page-header";
import { saveWeeklyHours, disconnectGoogle } from "./actions";
import { WeeklyHoursEditor } from "./weekly-hours-editor";
import type { AvailabilityRule } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const user = await getAuthUser();
  const profile = await getOrCreateProfile(user!);
  const admin = supabaseAdmin();

  const { data: schedule } = await admin
    .from("availability_schedules")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_default", true)
    .maybeSingle();

  const { data: rules } = schedule
    ? await admin.from("availability_rules").select("*").eq("schedule_id", schedule.id)
    : { data: [] };

  const saveWithId = schedule ? saveWeeklyHours.bind(null, schedule.id) : async () => {};

  const googleCard = (
    <section aria-labelledby="h-google" className="flex flex-col gap-3.5 border border-ink p-6">
      <span className={`tag tag-fill self-start ${profile.google_connected ? "bg-celeste" : "bg-bone"}`}>
        {profile.google_connected ? "Conectado" : "No conectado"}
      </span>
      <h2 id="h-google" className="font-display text-[32px] font-normal leading-[38px]">
        Google Calendar
      </h2>
      <p className="text-[13px] leading-[17px]">
        Los eventos ocupados de tu calendario bloquean horarios, y cada reserva confirmada se crea como evento con la
        persona invitada.
      </p>
      {profile.google_connected && profile.google_email && (
        <span className="lbl break-all text-indigo">{profile.google_email}</span>
      )}
      {profile.google_connected ? (
        <form action={disconnectGoogle}>
          <button type="submit" className="btn">
            Desconectar
          </button>
        </form>
      ) : (
        <a href="/api/google/connect" className="btn btn-ink self-start">
          Conectar Google Calendar
        </a>
      )}
    </section>
  );

  return (
    <>
      <AdminPageHeader n="03" title="Disponibilidad">
        {schedule && (
          <button type="submit" form="hours-form" className="btn btn-ink btn-lg">
            Guardar cambios
          </button>
        )}
      </AdminPageHeader>

      {schedule ? (
        <WeeklyHoursEditor action={saveWithId} rules={(rules ?? []) as AvailabilityRule[]} timezone={schedule.timezone}>
          {googleCard}
        </WeeklyHoursEditor>
      ) : (
        <>
          <p className="text-lg">Configurando tu horario…</p>
          <div className="max-w-md">{googleCard}</div>
        </>
      )}
    </>
  );
}
