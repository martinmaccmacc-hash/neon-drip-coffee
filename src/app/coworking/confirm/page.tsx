import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { TIME_ZONE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Reserva confirmada",
  robots: { index: false, follow: false },
};

export default async function CoworkingConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ reservation?: string }>;
}) {
  const { reservation: reservationId } = await searchParams;

  if (!reservationId) {
    return (
      <EmptyState message="No encontramos ninguna reserva para mostrar." />
    );
  }

  const session = await auth();
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { cyberPod: true, user: true },
  });

  // Solo el dueño de la reserva puede ver el detalle
  if (!reservation || reservation.userId !== session?.user?.id) {
    return <EmptyState message="No encontramos esa reserva." />;
  }

  const dateLabel = reservation.startTime.toLocaleDateString("es-UY", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const startLabel = reservation.startTime.toLocaleTimeString("es-UY", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
  const endLabel = reservation.endTime.toLocaleTimeString("es-UY", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-void px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-neon-cyan/40 bg-surface p-8 text-center">
        <p className="font-mono text-sm text-neon-cyan">
          {"// reserva confirmada"}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          ¡Listo, {reservation.user.name.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-sm text-dim">{reservation.cyberPod.name}</p>

        <div className="mt-6 space-y-2 border-t border-line pt-6 text-left font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-dim">Fecha</span>
            <span className="capitalize text-ink">{dateLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dim">Horario</span>
            <span className="text-ink">
              {startLabel} - {endLabel}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-dim">Personas</span>
            <span className="text-ink">{reservation.attendees}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between border-t border-line pt-4 font-display text-lg font-bold">
          <span className="text-ink">Total</span>
          <span className="text-neon-cyan">
            {formatPrice(Number(reservation.totalPrice))}
          </span>
        </div>

        <Link
          href="/coworking"
          className="mt-8 inline-block rounded-lg bg-neon-purple px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
        >
          Ver otros espacios
        </Link>
      </div>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-void px-6 text-center">
      <p className="font-mono text-dim">{message}</p>
      <Link
        href="/coworking"
        className="rounded-lg bg-neon-purple px-4 py-2 font-mono text-xs uppercase tracking-wide text-void"
      >
        Ver espacios
      </Link>
    </main>
  );
}
