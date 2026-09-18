import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import type { Reservation, CyberPod } from "@prisma/client";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente de pago",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
  NO_SHOW: "No asistió",
};

type ReservationWithPod = Reservation & { cyberPod: CyberPod };

export default async function ReservationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { cyberPod: true },
    orderBy: { startTime: "desc" },
  });

  const now = new Date();
  const upcoming = reservations.filter(
    (r) => r.startTime >= now && r.status !== "CANCELLED"
  );
  const past = reservations.filter(
    (r) => r.startTime < now || r.status === "CANCELLED"
  );

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">
        {"// account/reservations"}
      </p>
      <h1 className="mt-2 mb-8 font-display text-2xl font-bold text-ink">
        Tus reservas
      </h1>

      {reservations.length === 0 ? (
        <p className="font-mono text-sm text-dim">
          Todavía no reservaste ningún Cyber-Pod.
        </p>
      ) : (
        <>
          {upcoming.length > 0 && (
            <ReservationGroup title="Próximas" reservations={upcoming} />
          )}
          {past.length > 0 && (
            <ReservationGroup
              title="Anteriores"
              reservations={past}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  );
}

function ReservationGroup({
  title,
  reservations,
  className = "",
}: {
  title: string;
  reservations: ReservationWithPod[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="mb-4 font-mono text-xs uppercase text-dim">{title}</h2>
      <div className="space-y-4">
        {reservations.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-line bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink">
                {r.cyberPod.name}
              </h3>
              <span className="font-mono text-xs uppercase text-neon-pink">
                {STATUS_LABEL[r.status] ?? r.status}
              </span>
            </div>
            <div className="mt-3 space-y-1 border-t border-line pt-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-dim">Fecha</span>
                <span className="capitalize text-ink">
                  {r.startTime.toLocaleDateString("es-UY", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dim">Horario</span>
                <span className="text-ink">
                  {r.startTime.toLocaleTimeString("es-UY", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {r.endTime.toLocaleTimeString("es-UY", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dim">Total</span>
                <span className="text-ink">
                  {formatPrice(Number(r.totalPrice))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
