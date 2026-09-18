import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { CancelSubscriptionButton } from "@/components/account/cancel-subscription-button";

const FREQUENCY_LABEL: Record<string, string> = {
  WEEKLY: "Cada semana",
  BIWEEKLY: "Cada 2 semanas",
  MONTHLY: "Cada mes",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  CANCELLED: "Cancelada",
  PAST_DUE: "Pago pendiente",
};

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: { plan: true, address: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">
        {"// account/subscriptions"}
      </p>
      <h1 className="mt-2 mb-8 font-display text-2xl font-bold text-ink">
        Tus suscripciones
      </h1>

      {subscriptions.length === 0 ? (
        <p className="font-mono text-sm text-dim">
          Todavía no tenés ninguna suscripción a Bean Deploy.
        </p>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">
                  {sub.plan.name}
                </h2>
                <span className="font-mono text-xs uppercase text-neon-pink">
                  {STATUS_LABEL[sub.status] ?? sub.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 border-t border-line pt-4 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-dim">Frecuencia</span>
                  <span className="text-ink">
                    {FREQUENCY_LABEL[sub.plan.frequency]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">Precio</span>
                  <span className="text-ink">
                    {formatPrice(Number(sub.plan.price))}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="shrink-0 text-dim">Envío a</span>
                  <span className="text-right text-ink">
                    {sub.address.street} {sub.address.number},{" "}
                    {sub.address.city}
                  </span>
                </div>
                {sub.status === "ACTIVE" && (
                  <div className="flex justify-between">
                    <span className="text-dim">Próximo cobro</span>
                    <span className="text-ink">
                      {sub.currentPeriodEnd.toLocaleDateString("es-UY", {
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {sub.status === "ACTIVE" && (
                <div className="mt-4 border-t border-line pt-4">
                  <CancelSubscriptionButton subscriptionId={sub.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
