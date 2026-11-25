import Link from "next/link";
import { Plus } from "lucide-react";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { getOrCreateProfile } from "@/lib/profile";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EventTypeCard } from "./event-type-card";
import type { EventType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SchedulingPage() {
  const user = await getAuthUser();
  const profile = await getOrCreateProfile(user!);
  const admin = supabaseAdmin();

  const { data: eventTypes } = await admin
    .from("event_types")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: true });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const all = (eventTypes ?? []) as EventType[];
  const groups = [
    { n: "01", color: "#F5EFA7", title: "Clientes nuevos", items: all.filter((e) => e.audience !== "existing") },
    { n: "02", color: "#EAC5E6", title: "Clientes actuales", items: all.filter((e) => e.audience === "existing") },
  ].filter((g) => g.items.length);

  return (
    <>
      <AdminPageHeader n="02" title="Tipos de sesión">
        <Link href="/scheduling/new" className="btn btn-ink btn-lg">
          <Plus size={14} strokeWidth={1.5} /> Crear sesión
        </Link>
      </AdminPageHeader>

      {!all.length ? (
        <div className="border border-dashed border-ink py-16 text-center text-lg">
          Aún no hay tipos de sesión. Crea el primero para empezar a recibir reservas.
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.n} className="flex flex-col gap-[18px]">
            <div className="flex items-center gap-3">
              <span className="lbl inline-flex h-8 min-w-8 items-center justify-center rounded-[4px]" style={{ background: g.color }}>
                {g.n}
              </span>
              <h2 className="font-display text-[32px] font-normal leading-[38px]">{g.title}</h2>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-[18px]">
              {g.items.map((eventType) => (
                <EventTypeCard
                  key={eventType.id}
                  eventType={eventType}
                  bookingUrl={`${appUrl}/${profile.username}/${eventType.slug}`}
                  bookingPath={`/${profile.username}/${eventType.slug}`}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
