import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOAuthClient, getGoogleEmail } from "@/lib/google";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const user = await getAuthUser();
  if (!user) return NextResponse.redirect(new URL("/login", appUrl));

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get("google_oauth_state")?.value;

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(new URL("/availability?google_error=1", appUrl));
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.refresh_token) {
      // Google only returns a refresh_token on first consent; if the user had
      // previously connected and revoked in Google's own settings, they must
      // remove app access there before reconnecting to get a fresh one.
      return NextResponse.redirect(new URL("/availability?google_error=missing_refresh_token", appUrl));
    }

    const email = tokens.access_token ? await getGoogleEmail(tokens.access_token) : null;

    const admin = supabaseAdmin();
    await admin
      .from("profiles")
      .update({
        google_refresh_token: tokens.refresh_token,
        google_connected: true,
        google_email: email,
      })
      .eq("id", user.id);

    const response = NextResponse.redirect(new URL("/availability?google_connected=1", appUrl));
    response.cookies.delete("google_oauth_state");
    return response;
  } catch (err) {
    console.error("Google OAuth callback failed", err);
    return NextResponse.redirect(new URL("/availability?google_error=1", appUrl));
  }
}
