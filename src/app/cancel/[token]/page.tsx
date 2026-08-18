import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CancelButton } from "./cancel-button";

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-xl border border-base-700 bg-base-900 p-8 text-center">
        <h1 className="text-lg font-semibold text-white">
          {booking.status === "canceled" ? "Booking canceled" : "Cancel booking?"}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {(booking as any).event_types?.name} — {formatted}
        </p>
        {booking.status !== "canceled" && <CancelButton token={params.token} />}
      </div>
    </div>
  );
}
