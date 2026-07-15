"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore, useCartTotal } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "./cart-item";

export function CartDrawer() {
  const router = useRouter();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const total = useCartTotal();

  if (!isOpen) return null;

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-void/70 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-bold text-ink">Tu carrito</h2>
          <button
            type="button"
            onClick={closeCart}
            className="text-dim transition-colors hover:text-neon-pink"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-dim">
              <ShoppingBag className="h-10 w-10" />
              <p className="font-mono text-sm">Todavía no agregaste nada.</p>
            </div>
          ) : (
            items.map((item) => <CartItem key={item.variantId} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-sm text-dim">Subtotal</span>
              <span className="font-display text-xl font-bold text-neon-cyan">
                {formatPrice(total)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-lg bg-neon-purple py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-[1.02] hover:bg-neon-pink"
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
