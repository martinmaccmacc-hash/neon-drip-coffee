"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/account", label: "Resumen" },
  { href: "/account/orders", label: "Pedidos" },
  { href: "/account/subscriptions", label: "Suscripciones" },
  { href: "/account/reservations", label: "Reservas" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mi cuenta"
      className="-mx-6 mb-10 flex gap-6 overflow-x-auto border-b border-line px-6 pb-4 font-mono text-sm md:mx-0 md:px-0"
    >
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap ${
              isActive
                ? "text-neon-cyan"
                : "text-dim transition-colors hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
