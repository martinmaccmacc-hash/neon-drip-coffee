import Link from "next/link";
import type { SubscriptionPlan } from "@prisma/client";
import { formatPrice } from "@/lib/utils";

const FREQUENCY_LABEL: Record<string, string> = {
  WEEKLY: "Cada semana",
  BIWEEKLY: "Cada 2 semanas",
  MONTHLY: "Cada mes",
};

// Este componente NO tiene "use client": no necesita interactividad propia
// (solo un Link), así que puede quedarse como Server Component y recibir
// el objeto `plan` de Prisma directo, Decimal incluido — nunca cruza al
// navegador, así que no hay problema de serialización acá.
export function PlanCard({ plan }: { plan: SubscriptionPlan }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-6">
      <div className="flex items-center gap-1.5 pb-4">
        <span className="h-2.5 w-2.5 rounded-full bg-neon-pink/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-cyan/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-purple/70" />
      </div>

      <h2 className="font-display text-xl font-bold text-ink">{plan.name}</h2>
      <p className="mt-2 flex-1 text-sm text-dim">{plan.description}</p>

      <div className="mt-6 space-y-1 font-mono text-xs text-dim">
        <p>
          <span className="text-neon-pink">frecuencia:</span>{" "}
          {FREQUENCY_LABEL[plan.frequency]}
        </p>
        <p>
          <span className="text-neon-pink">cantidad:</span> {plan.weightGr}g
          por envío
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <span className="font-display text-2xl font-bold text-neon-cyan">
          {formatPrice(Number(plan.price))}
        </span>
        <Link
          href={`/bean-deploy/${plan.id}`}
          className="rounded-lg bg-neon-purple px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
        >
          Elegir plan
        </Link>
      </div>
    </div>
  );
}
