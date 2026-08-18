import Link from "next/link";
import { CalendarCog, ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import type { Profile } from "@/lib/types";

export function Topbar({ profile }: { profile: Profile }) {
  return (
    <header className="flex items-center justify-between border-b border-base-800 px-8 py-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Scheduling</h1>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/availability"
          className="flex items-center gap-2 rounded-lg border border-base-600 px-3 py-2 text-sm text-neutral-200 transition hover:border-base-500"
        >
          <CalendarCog size={16} />
          Manage availability
        </Link>
        <Link
          href={`/${profile.username}`}
          target="_blank"
          className="flex items-center gap-2 rounded-lg border border-base-600 px-3 py-2 text-sm text-neutral-200 transition hover:border-base-500"
        >
          View landing page
          <ExternalLink size={14} />
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:text-white"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
