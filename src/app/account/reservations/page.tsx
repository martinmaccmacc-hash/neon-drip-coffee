import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import type { Reservation, CyberPod, Payment } from "@prisma/client";
import { TIME_ZONE } from "@/lib/site-config";
import {
  CANCELLATION_NOTICE_HOURS,
  canCancelReservation,
  isExpiredPending,
} from "@/lib/reservation-rules";
import { CancelReservationButton } from "@/components/account/cancel-reservation-button";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente de pago",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
  NO_SHOW: "No asistió",
};

type ReservationWithPod = Reservation & {
  cyberPod: CyberPod;
  payment: Payment | null;
};

function statusLabel(r: ReservationWithPod, now: Date) {
  if (isExpiredPending(r, now)) return "Pago no completado";
  if (r.status === "CANCELLED" && r.payment?.status === "REFUNDED") {
    return "Cancelada · reembolsada";
  }
  return STATUS_LABEL[r.status] ?? r.status;
}

export default async function ReservationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { cyberPod: true, payment: true },
    orderBy: { startTime: "desc" },
  });

  const now = new Date();
  const isUpcoming = (r: ReservationWithPod) =>
    r.startTime >= now && r.status !== "CANCELLED" && !isExpiredPending(r, now);
  const upcoming = reservations.filter(isUpcoming);
  const past = reservations.filter((r) => !isUpcoming(r));

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
            <ReservationGroup
              title="Próximas"
              reservations={upcoming}
              now={now}
            />
          )}
          {past.length > 0 && (
            <ReservationGroup
              title="Anteriores"
              reservations={past}
              now={now}
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
  now,
  className = "",
}: {
  title: string;
  reservations: ReservationWithPod[];
  now: Date;
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
                {statusLabel(r, now)}
              </span>
            </div>
            <div className="mt-3 space-y-1 border-t border-line pt-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-dim">Fecha</span>
                <span className="capitalize text-ink">
                  {r.startTime.toLocaleDateString("es-UY", {
                    timeZone: TIME_ZONE,
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
                    timeZone: TIME_ZONE,
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {r.endTime.toLocaleTimeString("es-UY", {
                    timeZone: TIME_ZONE,
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

            {canCancelReservation(r, now) ? (
              <div className="mt-4 border-t border-line pt-4">
                <CancelReservationButton reservationId={r.id} />
              </div>
            ) : (
              r.status === "CONFIRMED" &&
              r.startTime > now && (
                <p className="mt-4 border-t border-line pt-4 font-mono text-xs text-dim">
                  Faltan menos de {CANCELLATION_NOTICE_HOURS} horas: ya no se
                  puede cancelar.
                </p>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
