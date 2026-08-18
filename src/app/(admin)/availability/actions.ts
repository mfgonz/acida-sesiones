"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function requireUserId() {
  const user = await getAuthUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function saveWeeklyHours(scheduleId: string, formData: FormData) {
  const userId = await requireUserId();
  const admin = supabaseAdmin();

  const { data: schedule } = await admin
    .from("availability_schedules")
    .select("id")
    .eq("id", scheduleId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!schedule) throw new Error("Schedule not found");

  await admin.from("availability_rules").delete().eq("schedule_id", scheduleId);

  const rules = [];
  for (let day = 0; day < 7; day++) {
    if (formData.get(`day_${day}_enabled`) !== "on") continue;
    const start = String(formData.get(`day_${day}_start`) ?? "09:00");
    const end = String(formData.get(`day_${day}_end`) ?? "17:00");
    if (start >= end) continue;
    rules.push({ schedule_id: scheduleId, day_of_week: day, start_time: start, end_time: end });
  }

  if (rules.length) {
    await admin.from("availability_rules").insert(rules);
  }

  const timezone = String(formData.get("timezone") ?? "").trim();
  if (timezone) {
    await admin.from("availability_schedules").update({ timezone }).eq("id", scheduleId);
  }

  revalidatePath("/availability");
}

export async function disconnectGoogle() {
  const userId = await requireUserId();
  const admin = supabaseAdmin();
  await admin
    .from("profiles")
    .update({ google_connected: false, google_refresh_token: null, google_email: null })
    .eq("id", userId);
  revalidatePath("/availability");
}
