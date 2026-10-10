import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { blockingReservationWhere } from "@/lib/reservation-rules";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [orderCount, activeSubscription, upcomingReservationCount] =
    await Promise.all([
      prisma.order.count({ where: { userId: session.user.id } }),
      prisma.subscription.findFirst({
        where: { userId: session.user.id, status: "ACTIVE" },
        include: { plan: true },
      }),
      prisma.reservation.count({
        where: {
          userId: session.user.id,
          ...blockingReservationWhere(),
          startTime: { gte: new Date() },
        },
      }),
    ]);

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">{"// account/page.tsx"}</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">
        Hola, {session.user.name}
      </h1>
      <p className="mt-2 font-mono text-sm text-dim">{session.user.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Pedidos"
          value={String(orderCount)}
          href="/account/orders"
        />
        <SummaryCard
          title="Suscripción"
          value={activeSubscription ? activeSubscription.plan.name : "Ninguna"}
          href="/account/subscriptions"
        />
        <SummaryCard
          title="Reservas próximas"
          value={String(upcomingReservationCount)}
          href="/account/reservations"
        />
      </div>

      <SignOutButton />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-neon-purple/60"
    >
      <p className="font-mono text-xs uppercase text-dim">{title}</p>
      <p className="mt-2 font-display text-xl font-bold text-ink">{value}</p>
    </Link>
  );
}
