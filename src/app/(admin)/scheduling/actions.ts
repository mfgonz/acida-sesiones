"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { LocationType } from "@/lib/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requireUserId() {
  const user = await getAuthUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function createEventType(formData: FormData) {
  const userId = await requireUserId();
  const admin = supabaseAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const { data: schedule } = await admin
    .from("availability_schedules")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  const baseSlug = slugify(name) || "session";
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: taken } = await admin
      .from("event_types")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", slug)
      .maybeSingle();
    if (!taken) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  await admin.from("event_types").insert({
    user_id: userId,
    schedule_id: schedule?.id ?? null,
    slug,
    name,
    description: String(formData.get("description") ?? ""),
    duration_minutes: Number(formData.get("duration_minutes") ?? 30),
    location_type: String(formData.get("location_type") ?? "google_meet") as LocationType,
    location_details: String(formData.get("location_details") ?? ""),
    buffer_before_minutes: Number(formData.get("buffer_before_minutes") ?? 0),
    buffer_after_minutes: Number(formData.get("buffer_after_minutes") ?? 0),
    min_notice_minutes: Number(formData.get("min_notice_minutes") ?? 60),
    booking_horizon_days: Number(formData.get("booking_horizon_days") ?? 60),
    is_active: false,
  });

  revalidatePath("/scheduling");
  redirect("/scheduling");
}

export async function updateEventType(id: string, formData: FormData) {
  const userId = await requireUserId();
  const admin = supabaseAdmin();

  await admin
    .from("event_types")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? ""),
      duration_minutes: Number(formData.get("duration_minutes") ?? 30),
      location_type: String(formData.get("location_type") ?? "google_meet") as LocationType,
      location_details: String(formData.get("location_details") ?? ""),
      buffer_before_minutes: Number(formData.get("buffer_before_minutes") ?? 0),
      buffer_after_minutes: Number(formData.get("buffer_after_minutes") ?? 0),
      min_notice_minutes: Number(formData.get("min_notice_minutes") ?? 60),
      booking_horizon_days: Number(formData.get("booking_horizon_days") ?? 60),
    })
    .eq("id", id)
    .eq("user_id", userId);

  revalidatePath("/scheduling");
  redirect("/scheduling");
}

export async function toggleEventTypeActive(id: string, isActive: boolean) {
  const userId = await requireUserId();
  const admin = supabaseAdmin();
  await admin.from("event_types").update({ is_active: isActive }).eq("id", id).eq("user_id", userId);
  revalidatePath("/scheduling");
}

export async function deleteEventType(id: string) {
  const userId = await requireUserId();
  const admin = supabaseAdmin();
  await admin.from("event_types").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/scheduling");
}
