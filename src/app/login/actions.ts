"use server";

import { redirect } from "next/navigation";
import { supabaseServerAuth } from "@/lib/supabase/server-auth";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = supabaseServerAuth();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect("/login?error=1");

  redirect("/scheduling");
}

export async function signOut() {
  const supabase = supabaseServerAuth();
  await supabase.auth.signOut();
  redirect("/login");
}
