"use server";

import { redirect } from "next/navigation";
import { supabaseServerAuth } from "@/lib/supabase/server-auth";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) redirect("/login/reset-password?error=short");
  if (password !== confirmPassword) redirect("/login/reset-password?error=mismatch");

  const supabase = supabaseServerAuth();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/login/reset-password?error=1");

  redirect("/scheduling");
}
