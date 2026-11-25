import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PublicFooter } from "@/components/public-footer";
import { BRAND_USERNAME } from "@/lib/brand";
import { CancelButton } from "./cancel-button";

export const dynamic = "force-dynamic";

export default async function CancelPage({ params }: { params: { token: string } }) {
  const admin = supabaseAdmin();
  const { data: booking } = await admin
    .from("bookings")
    .select("*, event_types(name)")
    .eq("cancel_token", params.token)
    .maybeSingle();

  if (!booking) notFound();

  const tz = booking.invitee_timezone || "America/Panama";
  const start = new Date(booking.start_time);
  const when = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", timeZone: tz }).format(start);
  const time = new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(start);
  const canceled = booking.status === "canceled";

  return (
    <div className="min-h-screen font-body text-ink">
      <div className="mx-auto max-w-[1296px] px-4 sm:px-[clamp(16px,5vw,72px)]">
        <header className="flex flex-wrap items-center justify-between gap-[18px] border-b border-ink pb-6 pt-9">
          <Link href="/" aria-label="Inicio">
            <Image src="/brand/logo-acida-ink.png" alt="ÁCIDA" width={600} height={199} className="block h-9 w-auto" />
          </Link>
          <span className={`tag tag-fill ${canceled ? "bg-bone" : "bg-blush"}`}>
            {canceled ? "[ Cancelada ]" : "[ Cancelar ]"}
          </span>
        </header>

        <div className="flex max-w-3xl flex-col gap-9 py-12 sm:py-[72px]">
          <h1 className="font-display text-[56px] font-normal leading-[0.95] tracking-[-0.02em] lg:text-[80px]">
            {canceled ? "Sesión cancelada" : "¿Cancelar sesión?"}
          </h1>
          <dl className="grid gap-[18px] border-y border-ink py-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <dt className="lbl">Sesión</dt>
              <dd className="text-[28px] leading-[34px]">{(booking as any).event_types?.name ?? "Sesión"}</dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="lbl">Cuándo</dt>
              <dd className="text-[28px] leading-[34px]">
                {when.charAt(0).toUpperCase() + when.slice(1)} · {time}
              </dd>
            </div>
          </dl>
          {canceled ? (
            <Link href={`/${BRAND_USERNAME}`} className="btn btn-ink btn-lg self-start">
              Agendar una nueva sesión
            </Link>
          ) : (
            <CancelButton token={params.token} />
          )}
        </div>
        <PublicFooter />
      </div>
    </div>
  );
}
