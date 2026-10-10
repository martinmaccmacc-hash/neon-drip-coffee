import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { SubscribeForm } from "@/components/bean-deploy/subscribe-form";

const FREQUENCY_LABEL: Record<string, string> = {
  WEEKLY: "Cada semana",
  BIWEEKLY: "Cada 2 semanas",
  MONTHLY: "Cada mes",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planId: string }>;
}): Promise<Metadata> {
  const { planId } = await params;
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });
  if (!plan) return { title: "Plan no encontrado" };

  return {
    title: `${plan.name} — Bean Deploy`,
    description: plan.description,
    alternates: { canonical: `/bean-deploy/${plan.id}` },
  };
}

export default async function BeanDeployPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan || !plan.isActive) {
    notFound();
  }

  const session = await auth();
  const frequencyLabel = FREQUENCY_LABEL[plan.frequency];

  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <section>
          <div className="relative mb-8 aspect-[4/3] overflow-hidden rounded-2xl border border-line">
            <Image
              src="/images/bean-deploy-bag.jpg"
              alt="Bolsa de café Neon Ethiopia de Neon Drip Coffee"
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 768px) 448px, 100vw"
              className="object-cover"
            />
          </div>
          <p className="font-mono text-sm text-neon-cyan">
            {"// "}{plan.name.toLowerCase()}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">
            {plan.name}
          </h1>
          <p className="mt-3 text-dim">{plan.description}</p>

          <div className="mt-6 space-y-2 border-t border-line pt-6 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-dim">Frecuencia</span>
              <span className="text-ink">{frequencyLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dim">Cantidad por envío</span>
              <span className="text-ink">{plan.weightGr}g</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <span className="text-dim">Precio</span>
              <span className="font-display text-lg font-bold text-neon-cyan">
                {formatPrice(Number(plan.price))}
              </span>
            </div>
          </div>
        </section>

        <section>
          {session?.user ? (
            <SubscribeForm
              plan={{
                id: plan.id,
                name: plan.name,
                price: Number(plan.price),
                frequencyLabel,
              }}
            />
          ) : (
            <div className="rounded-xl border border-line bg-surface p-6 text-center">
              <p className="font-mono text-sm text-dim">
                Tenés que iniciar sesión para suscribirte a este plan.
              </p>
              <Link
                href={`/login?callbackUrl=/bean-deploy/${plan.id}`}
                className="mt-4 inline-block rounded-lg bg-neon-purple px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
              >
                Iniciar sesión
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
