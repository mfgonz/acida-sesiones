"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { addMinutes, addMonths, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import type { AudienceGroup } from "@/lib/types";

interface Props {
  username: string;
  slug: string;
  eventName: string;
  description: string;
  locationLabel: string;
  audience: AudienceGroup;
  durationMinutes: number;
  collectProjectDetails?: boolean;
}

type Step = "pick" | "form" | "done";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function PlusMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" aria-hidden="true" className="inline-block align-top">
      <rect x="0.5" y="0.5" width="19" height="19" fill="none" stroke="currentColor" />
      <path d="M5 10h10M10 5v10" stroke="currentColor" />
    </svg>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function BookingWidget({
  username,
  slug,
  eventName,
  description,
  locationLabel,
  audience,
  durationMinutes,
  collectProjectDetails,
}: Props) {
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ meetLink: string | null; cancelToken: string } | null>(null);
  const [formShownAt, setFormShownAt] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    fetch(`/api/availability?username=${username}&slug=${slug}&month=${format(month, "yyyy-MM")}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoading(false));
  }, [month, username, slug]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const iso of slots) {
      const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date(iso));
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(iso);
    }
    return map;
  }, [slots, timezone]);

  const daysInMonth = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const numDays = new Date(year, m + 1, 0).getDate();
    // getDay() is 0=Sunday..6=Saturday; shift so the grid starts on Monday.
    const firstDayOffset = (new Date(year, m, 1).getDay() + 6) % 7;
    const days: (string | null)[] = Array(firstDayOffset).fill(null);
    for (let d = 1; d <= numDays; d++) {
      days.push(format(new Date(year, m, d), "yyyy-MM-dd"));
    }
    return days;
  }, [month]);

  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es", { ...opts, timeZone: timezone }).format(new Date(iso));
  const fmtTime = (iso: string) => fmt(iso, { hour: "2-digit", minute: "2-digit", hour12: false });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        slug,
        startTime: selectedSlot,
        inviteeName: formData.get("name"),
        inviteeEmail: formData.get("email"),
        inviteePhone: formData.get("phone"),
        inviteeNotes: formData.get("notes") ?? "",
        inviteeTimezone: timezone,
        projectName: formData.get("projectName") ?? "",
        projectSummary: formData.get("projectSummary") ?? "",
        website: formData.get("website") ?? "",
        formShownAt,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setErrorMsg(data.error ?? "Algo salió mal. Por favor intenta con otro horario.");
      return;
    }

    setConfirmation({ meetLink: data.meetLink ?? null, cancelToken: data.cancelToken });
    setStep("done");
  }

  // ── Paso final: sesión confirmada (pantalla oliva) ─────────────────────────
  if (step === "done" && selectedSlot) {
    return (
      <div className="min-h-screen bg-olive font-body text-mustard">
        <div className="mx-auto max-w-[1296px] px-4 sm:px-[clamp(16px,5vw,72px)]">
          <header className="flex flex-wrap items-center justify-between gap-[18px] border-b border-mustard pb-6 pt-9">
            <Image src="/brand/logo-acida-mustard.png" alt="ÁCIDA" width={600} height={199} className="block h-11 w-auto" />
            <span className="tag tag-fill bg-mustard text-olive">[ Confirmada ]</span>
          </header>

          <div className="flex flex-wrap gap-[18px] py-12 sm:py-[72px]">
            <div className="flex min-w-0 flex-[3_1_480px] flex-col gap-9">
              <span className="lbl">Nos vemos pronto</span>
              <h1 className="font-display text-[56px] font-normal leading-[0.95] tracking-[-0.02em] lg:text-[clamp(56px,7vw,96px)]">
                Tu sesión está agendada <PlusMark />
              </h1>

              <dl className="grid gap-[18px] border-y border-mustard py-6 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <dt className="lbl">Sesión</dt>
                  <dd className="text-[28px] leading-[34px]">{eventName}</dd>
                </div>
                <div className="flex flex-col gap-2">
                  <dt className="lbl">Cuándo</dt>
                  <dd className="text-[28px] leading-[34px]">
                    {capitalize(fmt(selectedSlot, { weekday: "short", day: "numeric", month: "short" }))} · {fmtTime(selectedSlot)}
                  </dd>
                </div>
                <div className="flex flex-col gap-2">
                  <dt className="lbl">Dónde</dt>
                  <dd className="text-[28px] leading-[34px]">{locationLabel}</dd>
                </div>
              </dl>

              <p className="max-w-[620px] text-lg leading-[25px] text-cream">
                Te enviamos la invitación de calendario a tu correo
                {confirmation?.meetLink ? " con el enlace de la videollamada" : ""}. Si necesitas cancelar, puedes
                hacerlo desde aquí o desde el correo.
              </p>

              {confirmation?.meetLink && (
                <a
                  href={confirmation.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-lg text-mustard underline underline-offset-4 hover:text-cream"
                >
                  {confirmation.meetLink}
                </a>
              )}

              <div className="flex flex-wrap gap-3">
                {confirmation?.meetLink && (
                  <a
                    href={confirmation.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-lg border-mustard bg-mustard text-olive hover:bg-cream"
                  >
                    Unirse a la sesión
                  </a>
                )}
                <Link href={`/${username}`} className="btn btn-lg border-mustard text-mustard hover:bg-mustard/10">
                  Agendar otra sesión
                </Link>
                {confirmation && (
                  <a
                    href={`/cancel/${confirmation.cancelToken}`}
                    className="lbl inline-flex min-h-[52px] items-center px-2 !text-sm underline underline-offset-4 hover:text-cream"
                  >
                    ¿Necesitas cancelar?
                  </a>
                )}
              </div>
            </div>

            <figure className="m-0 flex flex-[2_1_320px] flex-col gap-3">
              <div className="flex h-[360px] items-center justify-center bg-cream p-9 sm:h-[460px]">
                <Image
                  src="/brand/ilustracion-abanico.png"
                  alt="Ilustración de línea continua: figuras con abanico"
                  width={1400}
                  height={788}
                  className="block max-h-full max-w-full object-contain"
                />
              </div>
              <figcaption className="lbl flex justify-between">
                <span>[ Ilustración ]</span>
                <span>01 / 05</span>
              </figcaption>
            </figure>
          </div>

          <PublicFooter tone="dark" />
        </div>
      </div>
    );
  }

  const audienceChip =
    audience === "existing"
      ? { text: "02 · Clientes actuales", color: "#EAC5E6" }
      : { text: "01 · Nueva colaboración", color: "#F5EFA7" };

  const header = (
    <header className="flex flex-wrap items-center justify-between gap-[18px] border-b border-ink pb-6 pt-9">
      {step === "form" ? (
        <button type="button" onClick={() => setStep("pick")} className="lbl inline-flex min-h-[44px] items-center gap-2 hover:text-olive">
          <ArrowLeft size={14} strokeWidth={1.5} /> Cambiar horario
        </button>
      ) : (
        <Link href={`/${username}`} className="lbl inline-flex min-h-[44px] items-center gap-2 hover:text-olive">
          <ArrowLeft size={14} strokeWidth={1.5} /> Volver
        </Link>
      )}
      <Link href={`/${username}`} aria-label="Inicio">
        <Image src="/brand/logo-acida-ink.png" alt="ÁCIDA" width={600} height={199} className="block h-9 w-auto" />
      </Link>
      <span className="lbl">{step === "form" ? "Paso 2 / 2 · [ Tus datos ]" : "Paso 1 / 2 · [ Horario ]"}</span>
    </header>
  );

  // ── Paso 2: tus datos ──────────────────────────────────────────────────────
  if (step === "form" && selectedSlot) {
    const end = addMinutes(new Date(selectedSlot), durationMinutes).toISOString();
    return (
      <div className="min-h-screen font-body text-ink">
        <div className="mx-auto max-w-[1296px] px-4 sm:px-[clamp(16px,5vw,72px)]">
          {header}
          <div className="flex flex-wrap gap-[18px] pb-[72px] pt-12">
            <aside className="flex flex-[1_1_320px] flex-col gap-6 self-start bg-mustard p-7 sm:p-9">
              <span className="lbl">[ Resumen ]</span>
              <h1 className="font-display text-[44px] font-normal leading-[0.95] tracking-[-0.02em] sm:text-[56px]">{eventName}</h1>
              <div className="flex flex-col gap-3 border-t border-ink pt-[18px]">
                <span className="text-[28px] leading-[34px] sm:text-[32px] sm:leading-[38px]">
                  {capitalize(fmt(selectedSlot, { weekday: "long", day: "numeric", month: "long" }))}
                </span>
                <span className="text-[28px] leading-[34px] sm:text-[32px] sm:leading-[38px]">
                  {fmtTime(selectedSlot)} – {fmtTime(end)}
                </span>
              </div>
              <div className="flex flex-col gap-2 border-t border-ink pt-[18px]">
                <span className="lbl">
                  {locationLabel} · {durationMinutes} min
                </span>
                <span className="lbl">Horario en {timezone}</span>
              </div>
            </aside>

            <form onSubmit={handleSubmit} className="flex min-w-0 flex-[2_1_480px] flex-col gap-6 lg:pl-[clamp(0px,3vw,72px)]">
              <h2 className="font-display text-[40px] font-normal leading-[44px] tracking-[-0.01em] sm:text-[56px] sm:leading-[60px]">
                Cuéntanos de ti
              </h2>

              {/* Honeypot: hidden from real users, often auto-filled by bots. */}
              <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Deja este campo vacío</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="grid gap-[18px] sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="lbl">Nombre *</span>
                  <input name="name" required autoComplete="name" placeholder="Nombre y apellido" className="fld" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="lbl">Correo *</span>
                  <input name="email" type="email" required autoComplete="email" placeholder="nombre@correo.com" className="fld" />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="lbl">WhatsApp *</span>
                <input name="phone" type="tel" required autoComplete="tel" placeholder="+507 6123 4567" className="fld" />
                <span className="lbl text-olive">Para avisarte si hay cambios en la sesión</span>
              </label>

              <div className="flex flex-col gap-[18px] border-t border-ink pt-6">
                {collectProjectDetails && (
                  <>
                    <span className="tag tag-fill self-start bg-celeste">[ El proyecto ]</span>
                    <label className="flex flex-col gap-2">
                      <span className="lbl">Nombre de tu proyecto o negocio *</span>
                      <input name="projectName" required className="fld" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="lbl">¿Qué están buscando trabajar junto a ÁCIDA? *</span>
                      <textarea name="projectSummary" required rows={4} className="fld" />
                    </label>
                  </>
                )}
                <label className="flex flex-col gap-2">
                  <span className="lbl">Notas (opcional)</span>
                  <textarea name="notes" rows={collectProjectDetails ? 2 : 3} className="fld" />
                </label>
              </div>

              {errorMsg && <p className="text-base text-terracotta">{errorMsg}</p>}

              <div className="flex flex-wrap items-center justify-between gap-[18px] border-t border-ink pt-6">
                <span className="max-w-[420px] text-[13px] leading-[17px]">
                  Te enviaremos la invitación por Google Calendar y un enlace para cancelar.
                </span>
                <button type="submit" disabled={submitting} className="btn btn-ink btn-lg">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Confirmar reserva
                  {!submitting && <ArrowRight size={14} strokeWidth={1.5} />}
                </button>
              </div>
            </form>
          </div>
          <PublicFooter />
        </div>
      </div>
    );
  }

  // ── Paso 1: elegir horario ─────────────────────────────────────────────────
  const selectedDaySlots = selectedDate ? slotsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="min-h-screen font-body text-ink">
      <div className="mx-auto max-w-[1296px] px-4 sm:px-[clamp(16px,5vw,72px)]">
        {header}
        <div className="flex flex-wrap gap-y-9 pb-[72px] pt-12">
          <aside className="flex flex-[1_1_300px] flex-col gap-6 pr-[18px]">
            <span className="tag tag-fill self-start" style={{ background: audienceChip.color }}>
              {audienceChip.text}
            </span>
            <h1 className="font-display text-[44px] font-normal leading-[0.95] tracking-[-0.02em] sm:text-[56px]">{eventName}</h1>
            <div className="flex flex-col gap-3 border-y border-ink py-[18px]">
              <span className="lbl">Duración · {durationMinutes} min</span>
              <span className="lbl">Lugar · {locationLabel}</span>
              <span className="lbl">Zona · {timezone}</span>
            </div>
            {description && <p className="text-lg leading-[25px]">{description}</p>}
          </aside>

          <section aria-label="Calendario" className="flex min-w-0 flex-[2_1_420px] flex-col gap-[18px] md:border-l md:border-ink md:px-[18px]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[32px] font-normal capitalize leading-[38px]">
                {format(month, "MMMM yyyy", { locale: es })}
              </h2>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  aria-label="Mes anterior"
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                  className="btn w-11 !px-0"
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  aria-label="Mes siguiente"
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                  className="btn w-11 !px-0"
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((d) => (
                <span key={d} className="lbl py-1.5 text-center">
                  {d}
                </span>
              ))}
              {daysInMonth.map((dateKey, i) => {
                if (!dateKey) return <span key={i} />;
                const hasSlots = (slotsByDate.get(dateKey)?.length ?? 0) > 0;
                const isSelected = selectedDate === dateKey;
                const dayNum = Number(dateKey.slice(-2));
                if (!hasSlots) {
                  return (
                    <span key={dateKey} className="flex h-12 items-center justify-center text-lg text-[#6b6a5c] sm:h-14">
                      {dayNum}
                    </span>
                  );
                }
                return (
                  <button
                    key={dateKey}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedDate(dateKey);
                      setSelectedSlot(null);
                    }}
                    className={`h-12 rounded-[4px] text-lg transition-colors sm:h-14 ${
                      isSelected ? "bg-ink text-cream" : "bg-celeste text-ink hover:bg-ink/80 hover:text-cream"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-[18px] border-t border-ink pt-3">
              <span className="lbl inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-[4px] bg-celeste" />
                Con horarios
              </span>
              <span className="lbl inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-[4px] bg-ink" />
                Elegido
              </span>
              {loading && <span className="lbl text-ink/60">Cargando disponibilidad…</span>}
            </div>
          </section>

          <section aria-label="Horarios" className="flex flex-[1_1_260px] flex-col gap-3 md:border-l md:border-ink md:pl-[18px]">
            <span className="lbl">
              {selectedDate
                ? new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(
                    new Date(`${selectedDate}T12:00:00`)
                  )
                : "Elige un día"}
            </span>
            {selectedDaySlots.map((iso) =>
              selectedSlot === iso ? (
                <div key={iso} className="flex gap-1.5">
                  <span className="flex h-[52px] flex-1 items-center justify-center rounded-[4px] bg-ink text-lg text-cream">
                    {fmtTime(iso)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormShownAt(Date.now());
                      setStep("form");
                    }}
                    className="lbl flex h-[52px] flex-1 items-center justify-center gap-1.5 rounded-[4px] bg-terracotta !text-sm text-ink transition-colors hover:bg-ink hover:text-cream"
                  >
                    Siguiente
                  </button>
                </div>
              ) : (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedSlot(iso)}
                  className="h-[52px] rounded-[4px] border border-ink text-lg transition-colors hover:bg-bone"
                >
                  {fmtTime(iso)}
                </button>
              )
            )}
            {selectedDate && !selectedDaySlots.length && <p className="text-base">No hay horarios disponibles este día.</p>}
            <span className="lbl mt-auto pt-3 text-ink/60">Horarios en {timezone}</span>
          </section>
        </div>
        <PublicFooter />
      </div>
    </div>
  );
}
