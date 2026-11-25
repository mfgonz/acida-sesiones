import Link from "next/link";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { getOrCreateProfile } from "@/lib/profile";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin-page-header";
import { BookingRow } from "./booking-row";
import type { Booking, EventType } from "@/lib/types";

export const dynamic = "force-dynamic";

const VIEWS = [
  { key: "proximas", label: "Próximas" },
  { key: "pasadas", label: "Pasadas" },
  { key: "canceladas", label: "Canceladas" },
] as const;
type View = (typeof VIEWS)[number]["key"];

export default async function CalendarPage({ searchParams }: { searchParams: { view?: string } }) {
  const user = await getAuthUser();
  const profile = await getOrCreateProfile(user!);
  const admin = supabaseAdmin();
  const view: View = VIEWS.some((v) => v.key === searchParams.view) ? (searchParams.view as View) : "proximas";
  const nowIso = new Date().toISOString();

  let query = admin.from("bookings").select("*").eq("user_id", profile.id);
  if (view === "proximas") query = query.eq("status", "confirmed").gte("start_time", nowIso).order("start_time", { ascending: true });
  if (view === "pasadas") query = query.eq("status", "confirmed").lt("start_time", nowIso).order("start_time", { ascending: false }).limit(60);
  if (view === "canceladas") query = query.eq("status", "canceled").order("start_time", { ascending: false }).limit(60);
  const { data: bookingRows } = await query;
  const bookings = (bookingRows ?? []) as Booking[];

  const { data: eventTypes } = await admin.from("event_types").select("*").eq("user_id", profile.id);
  const eventTypeMap = new Map((eventTypes as EventType[] | null)?.map((e) => [e.id, e]));

  // Summary tiles always describe what's coming up, whichever tab is open.
  const { data: upcomingRows } = await admin
    .from("bookings")
    .select("start_time, event_type_id")
    .eq("user_id", profile.id)
    .eq("status", "confirmed")
    .gte("start_time", nowIso);
  const upcoming = upcomingRows ?? [];
  const weekAhead = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const thisWeek = upcoming.filter((b) => new Date(b.start_time).getTime() <= weekAhead).length;
  const newClients = upcoming.filter((b) => eventTypeMap.get(b.event_type_id)?.audience !== "existing").length;

  const tz = profile.timezone;
  const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(iso));
  const todayKey = dayKey(nowIso);
  const groups: { key: string; label: string; items: Booking[] }[] = [];
  for (const b of bookings) {
    const key = dayKey(b.start_time);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      const label = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", timeZone: tz }).format(
        new Date(b.start_time)
      );
      group = { key, label: label.charAt(0).toUpperCase() + label.slice(1), items: [] };
      groups.push(group);
    }
    group.items.push(b);
  }

  return (
    <>
      <AdminPageHeader n="01" title="Calendario">
        <nav aria-label="Filtrar reservas" className="flex flex-wrap gap-1.5">
          {VIEWS.map((v) => (
            <Link
              key={v.key}
              href={v.key === "proximas" ? "/calendar" : `/calendar?view=${v.key}`}
              aria-current={view === v.key ? "page" : undefined}
              className={`btn ${view === v.key ? "btn-ink" : ""}`}
            >
              {v.label}
            </Link>
          ))}
        </nav>
      </AdminPageHeader>

      <section className="grid gap-[18px] sm:grid-cols-3">
        <div className="flex flex-col gap-3 bg-mustard p-6">
          <span className="lbl">Próximos 7 días</span>
          <span className="text-[56px] leading-[0.95]">{thisWeek}</span>
          <span className="text-[13px] leading-[17px]">sesiones confirmadas</span>
        </div>
        <div className="flex flex-col gap-3 bg-blush p-6">
          <span className="lbl">Clientes nuevos</span>
          <span className="text-[56px] leading-[0.95]">{newClients}</span>
          <span className="text-[13px] leading-[17px]">sesiones próximas</span>
        </div>
        <div className="flex flex-col gap-3 bg-celeste p-6">
          <span className="lbl">Total próximas</span>
          <span className="text-[56px] leading-[0.95]">{upcoming.length}</span>
          <span className="text-[13px] leading-[17px]">en el calendario</span>
        </div>
      </section>

      {!groups.length ? (
        <div className="border border-dashed border-ink py-16 text-center text-lg">
          {view === "proximas"
            ? "Aún no hay reservas próximas."
            : view === "pasadas"
              ? "Aún no hay sesiones pasadas."
              : "No hay sesiones canceladas."}
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.key} aria-label={g.label} className="flex flex-col">
            <div className="flex items-baseline justify-between gap-3 border-b border-ink pb-3">
              <h2 className="font-display text-[28px] font-normal leading-[34px] sm:text-[32px] sm:leading-[38px]">{g.label}</h2>
              <span className="lbl">
                {g.key === todayKey ? "Hoy · " : ""}
                {g.items.length} {g.items.length === 1 ? "sesión" : "sesiones"}
              </span>
            </div>
            {g.items.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                eventType={eventTypeMap.get(booking.event_type_id)}
                timezone={tz}
                username={profile.username}
                actionable={view === "proximas"}
              />
            ))}
          </section>
        ))
      )}
    </>
  );
}
