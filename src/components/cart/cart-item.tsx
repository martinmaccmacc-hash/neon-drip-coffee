"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, type CartItem as CartItemType } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartItem({ item }: { item: CartItemType }) {
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 border-b border-line py-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan font-display text-sm font-bold text-void">
        {item.productName.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-sm font-semibold text-ink">
              {item.productName}
            </p>
            <p className="font-mono text-xs text-dim">{item.variantName}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            className="text-dim transition-colors hover:text-neon-pink"
            aria-label={`Quitar ${item.productName} del carrito`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-line px-2 py-1">
            <button
              type="button"
              onClick={() => decrementItem(item.variantId)}
              className="text-dim transition-colors hover:text-neon-cyan"
              aria-label="Restar una unidad"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-4 text-center font-mono text-xs text-ink">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => incrementItem(item.variantId)}
              className="text-dim transition-colors hover:text-neon-cyan"
              aria-label="Sumar una unidad"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="font-mono text-sm text-neon-cyan">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
