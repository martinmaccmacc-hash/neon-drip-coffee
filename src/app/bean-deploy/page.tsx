import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PlanCard } from "@/components/bean-deploy/plan-card";

export const metadata: Metadata = {
  title: "Bean Deploy — Suscripción de café",
  description:
    "Suscribite y recibí café de especialidad en grano o molido en tu casa, cada semana, quincena o mes. Selección del barista con trazabilidad de origen.",
  alternates: { canonical: "/bean-deploy" },
};

// Revalida cada 5 minutos para reflejar cambios de la base de datos
export const revalidate = 300;

export default async function BeanDeployPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <header className="mx-auto mb-16 grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="text-center md:text-left">
          <p className="font-mono text-sm text-neon-cyan">{"// bean-deploy.tsx"}</p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-ink md:text-5xl">
            Bean Deploy
          </h1>
          <p className="mt-4 text-dim">
            Café de especialidad en grano o molido, elegido por el barista y
            desplegado directo a tu puerta.
          </p>

          <ol className="mt-8 space-y-3 text-left font-mono text-sm text-dim">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="text-neon-pink">0{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-line shadow-[0_0_80px_-20px_rgba(168,85,247,0.5)]">
          <Image
            src="/images/bean-deploy-bag.jpg"
            alt="Bolsa de café Neon Ethiopia de Neon Drip Coffee rodeada de granos tostados"
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 768px) 448px, calc(100vw - 48px)"
            className="object-cover"
          />
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </main>
  );
}

const STEPS = [
  "Elegí el plan y la frecuencia de envío",
  "Nuestro barista selecciona el grano del ciclo",
  "Lo recibís en tu casa, en grano o molido",
];
