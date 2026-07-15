"use client";

import { useState } from "react";
import type { MenuProduct } from "@/types";
import { VariantSelector } from "./variant-selector";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

const ROAST_LABEL: Record<string, string> = {
  LIGHT: "Tostado claro",
  MEDIUM: "Tostado medio",
  DARK: "Tostado oscuro",
};

export function ProductCard({ product }: { product: MenuProduct }) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id
  );
  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];

  const addItem = useCartStore((s) => s.addItem);

  const initials = product.name
    .split(" ")
    .filter((word) => /[A-Za-z0-9]/.test(word[0]))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-neon-purple/60">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-neon-pink/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-cyan/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-purple/70" />
        <span className="ml-2 truncate font-mono text-xs text-dim">
          {selectedVariant?.sku ?? product.slug}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan font-display text-lg font-bold text-void">
            {initials}
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight text-ink">
              {product.name}
            </h3>
            {product.origin && (
              <p className="mt-0.5 font-mono text-xs text-neon-cyan">
                {product.origin}
              </p>
            )}
          </div>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-dim">
          {product.description}
        </p>

        {product.tastingNotes && (
          <p className="mb-4 font-mono text-xs text-dim">
            <span className="text-neon-pink">notes:</span>{" "}
            {product.tastingNotes}
          </p>
        )}

        {product.roastLevel && product.intensity !== null && (
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-dim">
              {ROAST_LABEL[product.roastLevel] ?? product.roastLevel}
            </span>
            <IntensityBars value={product.intensity!} />
          </div>
        )}

        <div className="mt-auto space-y-3 pt-2">
          {product.variants.length > 1 && (
            <VariantSelector
              variants={product.variants}
              selectedId={selectedVariantId}
              onChange={setSelectedVariantId}
            />
          )}

          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="font-display text-xl font-bold text-neon-cyan">
              {selectedVariant ? formatPrice(selectedVariant.price) : "—"}
            </span>
            <button
              type="button"
              onClick={() => {
                if (!selectedVariant) return;
                addItem({
                  variantId: selectedVariant.id,
                  productId: product.id,
                  productName: product.name,
                  variantName: selectedVariant.name,
                  price: selectedVariant.price,
                  sku: selectedVariant.sku,
                });
              }}
              className="rounded-lg bg-neon-purple px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function IntensityBars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Intensidad ${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`h-3 w-1.5 rounded-sm ${
            i < value ? "bg-neon-pink" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}
