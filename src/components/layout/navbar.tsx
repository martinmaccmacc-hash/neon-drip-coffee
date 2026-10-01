"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore, useCartItemCount } from "@/store/cart-store";

const NAV_LINKS = [
  { href: "/menu", label: "Menú" },
  { href: "/bean-deploy", label: "Bean Deploy" },
  { href: "/coworking", label: "Coworking" },
];

// Navbar mobile-first: menú hamburguesa en mobile y fondo que se vuelve sólido al hacer scroll
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // true solo en el cliente: evita el desfase de hidratación del contador del carrito
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Cierra el menú al cambiar de ruta
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const itemCount = useCartItemCount();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const { data: session, status } = useSession();

  const solid = scrolled || menuOpen;

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${
        solid ? "border-line bg-void/85" : "border-white/5 bg-void/30"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-12">
        <Link
          href="/"
          className="font-display text-sm font-bold uppercase tracking-wide text-ink sm:text-lg"
        >
          Neon<span className="text-neon-cyan">Drip</span>Coffee
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Links (desktop) */}
          <nav
            aria-label="Principal"
            className="hidden items-center gap-6 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                active={pathname === link.href}
              />
            ))}
            <AuthLinks status={status} name={session?.user?.name} />
          </nav>

          <button
            type="button"
            onClick={toggleCart}
            className="relative rounded-lg border border-line p-2 text-ink transition-colors hover:border-neon-purple hover:text-neon-purple"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neon-pink font-mono text-[10px] font-bold text-void">
                {itemCount}
              </span>
            )}
          </button>

          {/* Hamburguesa (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-line p-2 text-ink transition-colors hover:border-neon-cyan hover:text-neon-cyan md:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Panel mobile, animado con grid-rows */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <nav
            aria-label="Principal"
            className="flex flex-col gap-1 border-t border-line px-4 py-4 sm:px-6"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`rounded-lg px-3 py-3 font-mono text-sm transition-colors hover:bg-surface hover:text-neon-cyan ${
                  pathname === link.href ? "text-neon-cyan" : "text-dim"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-line pt-3">
              {status === "authenticated" ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <Link
                    href="/account"
                    className="font-mono text-sm text-dim transition-colors hover:text-neon-cyan"
                  >
                    Mi cuenta ({session.user?.name?.split(" ")[0]})
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="font-mono text-xs uppercase tracking-wide text-dim transition-colors hover:text-neon-pink"
                  >
                    Salir
                  </button>
                </div>
              ) : status === "unauthenticated" ? (
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-3 font-mono text-sm text-dim transition-colors hover:bg-surface hover:text-neon-cyan"
                >
                  Ingresar
                </Link>
              ) : null}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`font-mono text-sm transition-colors hover:text-neon-cyan ${
        active ? "text-neon-cyan" : "text-dim"
      }`}
    >
      {label}
    </Link>
  );
}

function AuthLinks({
  status,
  name,
}: {
  status: "authenticated" | "unauthenticated" | "loading";
  name?: string | null;
}) {
  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/account"
          className="font-mono text-sm text-dim transition-colors hover:text-neon-cyan"
        >
          {name?.split(" ")[0]}
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="font-mono text-xs uppercase tracking-wide text-dim transition-colors hover:text-neon-pink"
        >
          Salir
        </button>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Link
        href="/login"
        className="font-mono text-sm text-dim transition-colors hover:text-neon-cyan"
      >
        Ingresar
      </Link>
    );
  }

  // Placeholder mientras carga la sesión
  return <span className="w-16" />;
}
