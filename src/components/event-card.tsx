import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LOCATION_LABELS, type EventType } from "@/lib/types";

/** One bookable session, drawn as a full-width row between ink rules. */
export function EventCard({ eventType, href }: { eventType: EventType; href: string }) {
  return (
    <Link
      href={href}
      className="group grid items-center gap-[18px] border-b border-ink py-7 text-ink transition-colors hover:bg-bone md:grid-cols-[1fr_1fr_auto]"
    >
      <div className="flex flex-col gap-2">
        <span className="lbl">
          {eventType.duration_minutes} min · {LOCATION_LABELS[eventType.location_type]}
        </span>
        <span className="text-[28px] leading-[34px] sm:text-[32px] sm:leading-[38px]">{eventType.name}</span>
      </div>
      <p className="max-w-[460px] text-lg leading-[25px]">{eventType.description}</p>
      <span className="btn btn-ink btn-lg justify-self-start md:justify-self-end">
        Agendar <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
