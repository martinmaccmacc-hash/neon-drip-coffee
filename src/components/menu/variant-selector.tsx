"use client";

import type { MenuVariant } from "@/types";

export function VariantSelector({
  variants,
  selectedId,
  onChange,
}: {
  variants: MenuVariant[];
  selectedId: string | undefined;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="Elegir tamaño o variante"
    >
      {variants.map((variant) => {
        const isSelected = variant.id === selectedId;
        return (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(variant.id)}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
              isSelected
                ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                : "border-line text-dim hover:border-neon-cyan/50 hover:text-ink"
            }`}
          >
            {variant.name}
          </button>
        );
      })}
    </div>
  );
}
