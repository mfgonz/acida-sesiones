import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-nf-client-connection-ip") || "unknown";
}

/**
 * Fixed-window rate limit backed by Postgres (serverless function instances
 * don't share memory, so this can't be tracked in-process). Records a hit
 * regardless of outcome, then reports whether the caller is over the limit.
 */
export async function isRateLimited(bucket: string, key: string, max: number, windowMinutes: number): Promise<boolean> {
  const admin = supabaseAdmin();
  const windowStart = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const { count } = await admin
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("bucket", bucket)
    .eq("key", key)
    .gte("created_at", windowStart);

  await admin.from("rate_limit_hits").insert({ bucket, key });

  // Opportunistic cleanup so the table doesn't grow unbounded (no cron needed).
  if (Math.random() < 0.02) {
    await admin.from("rate_limit_hits").delete().lt("created_at", new Date(Date.now() - 86_400_000).toISOString());
  }

  return (count ?? 0) >= max;
}
