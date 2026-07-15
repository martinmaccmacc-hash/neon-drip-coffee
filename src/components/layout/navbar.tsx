"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore, useCartItemCount } from "@/store/cart-store";

export function Navbar() {
  // Truco para evitar el "hydration mismatch" explicado arriba: no
  // mostramos el número del carrito hasta que el componente ya está
  // corriendo en el navegador (después del primer render).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const itemCount = useCartItemCount();
  const toggleCart = useCartStore((s) => s.toggleCart);

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-void/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-bold uppercase tracking-wide text-ink"
        >
          Neon<span className="text-neon-cyan">Drip</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/menu"
            className="font-mono text-sm text-dim transition-colors hover:text-neon-cyan"
          >
            Menú
          </Link>
          <Link
            href="/bean-deploy"
            className="font-mono text-sm text-dim transition-colors hover:text-neon-cyan"
          >
            Bean Deploy
          </Link>
          <Link
            href="/coworking"
            className="font-mono text-sm text-dim transition-colors hover:text-neon-cyan"
          >
            Coworking
          </Link>

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
        </div>
      </div>
    </nav>
  );
}
