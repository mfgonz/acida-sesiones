import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LocationIcon } from "@/components/location-icon";
import { LOCATION_LABELS, type EventType } from "@/lib/types";

export function EventCard({ eventType, href }: { eventType: EventType; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-ink/10 bg-white/60 px-6 py-5 transition hover:border-terracotta hover:bg-white"
    >
      <LocationIcon locationType={eventType.location_type} color={eventType.color} />
      <div className="flex-1">
        <p className="font-display font-bold text-ink">{eventType.name}</p>
        <p className="mt-1 font-label text-xs uppercase tracking-wide text-ink/50">
          {eventType.duration_minutes} min · {LOCATION_LABELS[eventType.location_type]}
        </p>
        {eventType.description && (
          <p className="mt-2 font-body text-sm text-ink/70">{eventType.description}</p>
        )}
      </div>
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/40 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-terracotta group-hover:bg-terracotta group-hover:text-cream">
        <ArrowUpRight size={16} />
      </span>
    </Link>
  );
}
