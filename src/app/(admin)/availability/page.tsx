import { CalendarCheck2, Unplug } from "lucide-react";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { getOrCreateProfile } from "@/lib/profile";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-1 text-base font-semibold text-white">Google Calendar</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Connect your calendar so busy times are blocked and new bookings are added automatically.
        </p>

        <div className="flex max-w-xl items-center justify-between rounded-lg border border-base-700 bg-base-900 px-5 py-4">
          <div className="flex items-center gap-3">
            <CalendarCheck2 size={20} className={profile.google_connected ? "text-green-400" : "text-neutral-500"} />
            <div>
              <p className="text-sm font-medium text-white">
                {profile.google_connected ? "Connected" : "Not connected"}
              </p>
              {profile.google_connected && profile.google_email && (
                <p className="text-xs text-neutral-400">{profile.google_email}</p>
              )}
            </div>
          </div>

          {profile.google_connected ? (
            <form action={disconnectGoogle}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-base-600 px-3 py-1.5 text-sm text-neutral-200 hover:border-base-500"
              >
                <Unplug size={14} /> Disconnect
              </button>
            </form>
          ) : (
            <a
              href="/api/google/connect"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              Connect Google Calendar
            </a>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-base font-semibold text-white">Working hours</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Applies to all event types using your default schedule.
        </p>
        {schedule ? (
          <WeeklyHoursEditor
            action={saveWithId}
            rules={(rules ?? []) as AvailabilityRule[]}
            timezone={schedule.timezone}
          />
        ) : (
          <p className="text-sm text-neutral-500">Setting up your schedule…</p>
        )}
      </section>
    </div>
  );
}
