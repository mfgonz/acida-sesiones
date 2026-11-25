import { notFound } from "next/navigation";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PublicFooter } from "@/components/public-footer";
import { EventCard } from "@/components/event-card";
import { PanamaWidget } from "@/components/panama-widget";
import { BRAND_HANDLE } from "@/lib/brand";
import { getPanamaWeather } from "@/lib/weather";
import type { EventType } from "@/lib/types";

function PlusMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" aria-hidden="true" className="inline-block align-top">
      <rect x="0.5" y="0.5" width="19" height="19" fill="none" stroke="currentColor" />
      <path d="M5 10h10M10 5v10" stroke="currentColor" />
    </svg>
  );
}

function SectionHeading({ n, color, id, children }: { n: string; color: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[18px] border-b border-ink pb-[18px]">
      <span
        className="lbl inline-flex h-9 min-w-9 items-center justify-center rounded-[4px] !text-sm"
        style={{ background: color }}
      >
        {n}
      </span>
      <h2 id={id} className="font-display text-[40px] font-normal leading-[44px] tracking-[-0.01em] sm:text-[56px] sm:leading-[60px]">
        {children}
      </h2>
    </div>
  );
}

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
    <div className="min-h-screen font-body text-ink">
      <div className="mx-auto max-w-[1296px] px-4 sm:px-[clamp(16px,5vw,72px)]">
        <header className="flex flex-wrap items-center justify-between gap-[18px] border-b border-ink pb-6 pt-9">
          <div className="flex items-end gap-3">
            <Image
              src="/logo-acida.webp"
              alt="ÁCIDA"
              width={480}
              height={186}
              priority
              unoptimized
              className="h-11 w-auto"
            />
            <span className="lbl mb-1">{BRAND_HANDLE}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="tag">
              Ciudad de Panamá{weather ? ` · ${weather.temperature} °C` : ""}
            </span>
            <span className="tag tag-fill bg-celeste">[ Sesiones ]</span>
          </div>
        </header>

        <section className="grid gap-[18px] py-12 sm:py-[72px] lg:grid-cols-2">
          <div className="flex flex-col justify-between gap-9">
            <div className="lbl">Oficio creativo del bien</div>
            <h1 className="font-display text-[56px] font-normal leading-[0.95] tracking-[-0.02em] lg:text-[clamp(56px,7vw,96px)]">
              Agenda una sesión con nosotras <PlusMark />
            </h1>
            <p className="max-w-[560px] text-2xl leading-[30px] sm:text-[32px] sm:leading-[38px]">
              Acompañamos proyectos con [ propósito ]. Elige el tipo de sesión, el día y la hora que te queden mejor.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="tag">Sin registro</span>
              <span className="tag">Invitación por Google Calendar</span>
              <span className="tag">Hora local de Panamá</span>
            </div>
          </div>
          <figure className="relative m-0 flex flex-col gap-3">
            <Image
              src="/brand/proceso.webp"
              alt="Fotografía analógica del proceso de ácida"
              width={1200}
              height={1697}
              priority
              className="block h-[360px] w-full object-cover sm:h-[520px]"
            />
            <figcaption className="lbl flex justify-between">
              <span>[ Proceso ]</span>
              <span>01 / 05</span>
            </figcaption>
            <PanamaWidget weather={weather} />
          </figure>
        </section>

        {!all.length ? (
          <p className="pb-[72px] text-lg">No hay sesiones disponibles para agendar en este momento.</p>
        ) : (
          <>
            {newClientTypes.length > 0 && (
              <section aria-labelledby="s1" className="pb-[72px]">
                <SectionHeading n="01" color="#F5EFA7" id="s1">
                  Si quieres trabajar con nosotras
                </SectionHeading>
                {newClientTypes.map((eventType) => (
                  <EventCard key={eventType.id} eventType={eventType} href={`/${profile.username}/${eventType.slug}`} />
                ))}
              </section>
            )}

            {existingClientTypes.length > 0 && (
              <section aria-labelledby="s2" className="pb-[72px]">
                <SectionHeading n="02" color="#EAC5E6" id="s2">
                  Si ya trabajas con nosotras
                </SectionHeading>
                {existingClientTypes.map((eventType) => (
                  <EventCard key={eventType.id} eventType={eventType} href={`/${profile.username}/${eventType.slug}`} />
                ))}
              </section>
            )}
          </>
        )}

        <PublicFooter />
      </div>
    </div>
  );
}
