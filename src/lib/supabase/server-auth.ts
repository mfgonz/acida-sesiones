import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Auth-only client (anon key) used purely to read/write the Supabase Auth
 * session cookie for the single admin user. Never used for table queries —
 * use supabaseAdmin() for those.
 */
export function supabaseServerAuth() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context to write to.
            // Middleware handles session refresh in that case.
          }
        },
      },
    }
  );
}

export async function getAuthUser() {
  const supabase = supabaseServerAuth();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
