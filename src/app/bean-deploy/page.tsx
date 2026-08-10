import { prisma } from "@/lib/prisma";
import { PlanCard } from "@/components/bean-deploy/plan-card";

export default async function BeanDeployPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <header className="mx-auto mb-16 max-w-2xl text-center">
        <p className="font-mono text-sm text-neon-cyan">// bean-deploy.tsx</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-ink md:text-5xl">
          Bean Deploy
        </h1>
        <p className="mt-4 text-dim">
          Café de especialidad en grano o molido, elegido por el barista y
          desplegado directo a tu puerta.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </main>
  );
}
