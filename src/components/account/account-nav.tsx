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
    <nav className="mb-10 flex gap-6 border-b border-line pb-4 font-mono text-sm">
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              isActive
                ? "text-neon-cyan"
                : "text-dim transition-colors hover:text-ink"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
