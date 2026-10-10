import type { Prisma, Reservation } from "@prisma/client";

// Minutos que una reserva PENDING retiene el horario mientras se paga.
// Es mayor que la expiración del Checkout de Stripe (31 min) para que un
// pago tardío nunca confirme un horario que ya se liberó.
export const PENDING_HOLD_MINUTES = 35;
export const CHECKOUT_EXPIRES_MINUTES = 31;

// Anticipación mínima para cancelar con reembolso
export const CANCELLATION_NOTICE_HOURS = 2;

const MINUTE_MS = 60 * 1000;

function pendingCutoff(now: Date) {
  return new Date(now.getTime() - PENDING_HOLD_MINUTES * MINUTE_MS);
}

// Reservas que ocupan el horario: pagas, o pendientes dentro del margen de pago
export function blockingReservationWhere(
  now = new Date()
): Prisma.ReservationWhereInput {
  return {
    OR: [
      { status: { in: ["CONFIRMED", "COMPLETED"] } },
      { status: "PENDING", createdAt: { gt: pendingCutoff(now) } },
    ],
  };
}

// Reserva cuyo pago nunca se completó
export function isExpiredPending(
  reservation: Pick<Reservation, "status" | "createdAt">,
  now = new Date()
) {
  return (
    reservation.status === "PENDING" &&
    reservation.createdAt <= pendingCutoff(now)
  );
}

export function canCancelReservation(
  reservation: Pick<Reservation, "status" | "startTime">,
  now = new Date()
) {
  const deadline =
    reservation.startTime.getTime() - CANCELLATION_NOTICE_HOURS * 60 * MINUTE_MS;
  return reservation.status === "CONFIRMED" && now.getTime() < deadline;
}
