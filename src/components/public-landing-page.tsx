import { notFound } from "next/navigation";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PublicFooter } from "@/components/public-footer";
import { EventCard } from "@/components/event-card";
import { PanamaWidget } from "@/components/panama-widget";
import { BRAND_HANDLE, BRAND_DESCRIPTION } from "@/lib/brand";
import { getPanamaWeather } from "@/lib/weather";
import type { EventType } from "@/lib/types";

export async function PublicLandingPage({ username }: { username: string }) {
  const admin = supabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, username, full_name")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const { data: eventTypes } = await admin
    .from("event_types")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const all = (eventTypes ?? []) as EventType[];
  const newClientTypes = all.filter((e) => e.audience !== "existing");
  const existingClientTypes = all.filter((e) => e.audience === "existing");
  const weather = await getPanamaWeather();

  return (
    <div className="min-h-screen font-body">
      <PanamaWidget weather={weather} />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-10">
          <div className="flex items-end gap-2">
            <Image
              src="/logo-acida.webp"
              alt="ÁCIDA"
              width={480}
              height={186}
              priority
              unoptimized
              className="h-9 w-auto sm:h-11"
            />
            <span className="mb-0.5 font-label text-sm font-normal text-ink/50">{BRAND_HANDLE}</span>
          </div>
          <p className="mt-2 max-w-md text-sm text-ink/70">{BRAND_DESCRIPTION}</p>
        </div>

        {!all.length ? (
          <p className="text-ink/60">No sessions are open for booking right now.</p>
        ) : (
          <div className="space-y-10">
            {newClientTypes.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 min-w-6 items-center justify-center bg-ink px-1 font-label text-xs text-cream">
                    01
                  </span>
                  <h2 className="font-display text-xl font-normal tracking-tight text-ink">
                    si quieres trabajar con nosotras
                  </h2>
                </div>
                <div className="space-y-3">
                  {newClientTypes.map((eventType) => (
                    <EventCard
                      key={eventType.id}
                      eventType={eventType}
                      href={`/${profile.username}/${eventType.slug}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {existingClientTypes.length > 0 && (
              <section className="border-t border-ink/10 pt-10">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 min-w-6 items-center justify-center bg-ink px-1 font-label text-xs text-cream">
                    02
                  </span>
                  <h2 className="font-display text-xl font-normal tracking-tight text-ink">
                    si ya trabajas con nosotras
                  </h2>
                </div>
                <div className="space-y-3">
                  {existingClientTypes.map((eventType) => (
                    <EventCard
                      key={eventType.id}
                      eventType={eventType}
                      href={`/${profile.username}/${eventType.slug}`}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <PublicFooter />
      </div>
    </div>
  );
}
