import Link from "next/link";
import { CalendarCog, ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import type { Profile } from "@/lib/types";

export function Topbar({ profile }: { profile: Profile }) {
  return (
    <header className="flex items-center justify-between border-b border-ink/10 px-8 py-4">
      <div>
        <h1 className="font-display text-lg font-bold text-ink">Scheduling</h1>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/availability"
          className="flex items-center gap-2 rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink/70 transition hover:border-terracotta hover:text-ink"
        >
          <CalendarCog size={16} />
          Manage availability
        </Link>
        <Link
          href={`/${profile.username}`}
          target="_blank"
          className="flex items-center gap-2 rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink/70 transition hover:border-terracotta hover:text-ink"
        >
          View landing page
          <ExternalLink size={14} />
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink/60 transition hover:text-ink"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
