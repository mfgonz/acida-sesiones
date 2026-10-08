"use server";

import { redirect } from "next/navigation";
import { supabaseServerAuth } from "@/lib/supabase/server-auth";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const supabase = supabaseServerAuth();

    // Supabase returns success regardless of whether the email is
    // registered, so this never reveals which emails have accounts.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/api/auth/confirm`,
    });
  }

  redirect("/login/forgot-password?sent=1");
}
