import { NextRequest, NextResponse } from "next/server";
import { supabaseServerAuth } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

/** Exchanges the PKCE code from a Supabase auth email link (password recovery) for a session. */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = supabaseServerAuth();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/login/reset-password", appUrl));
  }

  return NextResponse.redirect(new URL("/login/forgot-password?expired=1", appUrl));
}
