import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

/**
 * Looks up the profile row for the logged-in admin, creating it on first
 * login so no manual SQL insert is required after signing up in Supabase Auth.
 */
export async function getOrCreateProfile(user: User): Promise<Profile> {
  const admin = supabaseAdmin();

  const { data: existing } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  const usernameBase = (user.email ?? "user").split("@")[0].replace(/[^a-z0-9-]/gi, "").toLowerCase() || "user";
  let username = usernameBase;
  let attempt = 0;
  // Guard against username collisions (unlikely for a single-admin app, but cheap to handle).
  while (true) {
    const { data: taken } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (!taken) break;
    attempt += 1;
    username = `${usernameBase}-${attempt}`;
  }

  const { data: created, error } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      username,
      full_name: user.email ?? username,
    })
    .select("*")
    .single();

  if (error) throw error;

  await admin.from("availability_schedules").insert({
    user_id: user.id,
    name: "Working hours",
    is_default: true,
  });

  return created as Profile;
}
