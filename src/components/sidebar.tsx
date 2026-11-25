"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { signOut } from "@/app/login/actions";

const NAV_ITEMS = [
  { href: "/calendar", label: "Calendario", n: "01" },
  { href: "/scheduling", label: "Tipos de sesión", n: "02" },
  { href: "/availability", label: "Disponibilidad", n: "03" },
];

export function Sidebar({ username, googleConnected }: { username: string; googleConnected: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col gap-9 bg-olive px-6 py-9 text-mustard md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
      <Link href="/scheduling" className="self-start" aria-label="Inicio del panel">
        <Image src="/brand/logo-acida-mustard.png" alt="ÁCIDA" width={600} height={199} priority className="block h-10 w-auto" />
      </Link>

      <nav aria-label="Panel" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, n }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`lbl flex min-h-[44px] items-center gap-3 rounded-[4px] px-3 transition-colors ${
                active ? "bg-mustard text-olive" : "text-mustard hover:bg-ink"
              }`}
            >
              <span>{n}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-mustard pt-[18px]">
        <Link href="/availability" className="lbl inline-flex items-center gap-2 hover:text-cream">
          <span className={`h-2.5 w-2.5 rounded-full ${googleConnected ? "bg-celeste" : "bg-terracotta"}`} />
          {googleConnected ? "Google Calendar conectado" : "Google Calendar sin conectar"}
        </Link>
        <a
          href={`/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="lbl flex min-h-[44px] items-center gap-1.5 hover:text-cream"
        >
          Ver página pública <ArrowUpRight size={13} strokeWidth={1.5} />
        </a>
        <form action={signOut}>
          <button type="submit" className="lbl flex min-h-[44px] items-center hover:text-cream">
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
