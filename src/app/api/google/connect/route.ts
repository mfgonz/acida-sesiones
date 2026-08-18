import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { getGoogleAuthUrl } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));

  const state = randomBytes(16).toString("hex");
  const url = getGoogleAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return response;
}
