"use client";

import Image from "next/image";
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
    <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-ink/10 bg-white/60 px-3 py-4">
      <Link href="/scheduling" className="mb-6 block px-2">
        <Image src="/logo-acida-ink.webp" alt="ÁCIDA" width={1426} height={474} priority className="h-11 w-auto" />
      </Link>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-base transition ${
              active
                ? "bg-terracotta/10 font-medium text-terracotta"
                : "text-ink/60 hover:bg-ink/5 hover:text-ink"
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
