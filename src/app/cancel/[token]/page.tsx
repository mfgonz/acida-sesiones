import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PublicFooter } from "@/components/public-footer";
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

  const start = new Date(booking.start_time);
  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(start);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-xl border border-ink/10 bg-white p-8 text-center">
          <h1 className="font-display text-lg font-black text-ink">
            {booking.status === "canceled" ? "Booking canceled" : "Cancel booking?"}
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            {(booking as any).event_types?.name} — {formatted}
          </p>
          {booking.status !== "canceled" && <CancelButton token={params.token} />}
        </div>
        <PublicFooter />
      </div>
    </div>
  );
}
