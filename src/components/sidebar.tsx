"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, CalendarDays } from "lucide-react";

const NAV_ITEMS = [
  { href: "/scheduling", label: "Scheduling", icon: CalendarClock },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-base-800 bg-base-950 px-3 py-4">
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-900 text-xs font-semibold text-white">
          A
        </div>
        <span className="font-semibold text-white">ACIDA</span>
      </div>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
              active
                ? "bg-blue-900/40 font-medium text-white"
                : "text-neutral-400 hover:bg-base-850 hover:text-white"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
