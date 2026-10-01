"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore, useCartTotal } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "./cart-item";

export function CartDrawer() {
  const router = useRouter();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const pendingSubscription = useCartStore((s) => s.pendingSubscription);
  const clearSubscription = useCartStore((s) => s.clearSubscription);
  const total = useCartTotal();

  // Cierra con Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const isEmpty = items.length === 0 && !pendingSubscription;

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

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-line bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2
            id="cart-title"
            className="font-display text-lg font-bold text-ink"
          >
            Tu carrito
          </h2>
          <button
            type="button"
            onClick={closeCart}
            autoFocus
            className="text-dim transition-colors hover:text-neon-pink"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-dim">
              <ShoppingBag className="h-10 w-10" />
              <p className="font-mono text-sm">Todavía no agregaste nada.</p>
            </div>
          ) : (
            <>
              {pendingSubscription && (
                <div className="mt-4 rounded-lg border border-neon-purple/40 bg-void/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-neon-purple">
                        Suscripción
                      </p>
                      <p className="font-display text-sm font-semibold text-ink">
                        {pendingSubscription.planName}
                      </p>
                      <p className="font-mono text-xs text-dim">
                        {pendingSubscription.frequencyLabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearSubscription}
                      className="text-dim transition-colors hover:text-neon-pink"
                      aria-label="Quitar suscripción del carrito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-right font-mono text-sm text-neon-cyan">
                    {formatPrice(pendingSubscription.price)}
                  </div>
                </div>
              )}

              {items.map((item) => (
                <CartItem key={item.variantId} item={item} />
              ))}
            </>
          )}
        </div>

        {!isEmpty && (
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
