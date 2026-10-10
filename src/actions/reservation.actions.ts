"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { calculateReservationTotal } from "@/lib/coworking-pricing";
import {
  reservationSchema,
  type ReservationInput,
} from "@/lib/validations/reservation.schema";
import { SITE, SITE_URL } from "@/lib/site-config";
import {
  CANCELLATION_NOTICE_HOURS,
  CHECKOUT_EXPIRES_MINUTES,
  blockingReservationWhere,
  canCancelReservation,
} from "@/lib/reservation-rules";

type CreateReservationResult =
  | { success: true; checkoutUrl: string }
  | { success: false; error: string };

const APP_URL = SITE_URL;

export async function createReservation(
  input: ReservationInput
): Promise<CreateReservationResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Tenés que iniciar sesión para reservar" };
  }

  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { cyberPodId, startTime, durationHours, attendees, notes } = parsed.data;

  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  if (start < new Date()) {
    return { success: false, error: "No podés reservar en el pasado" };
  }

  const pod = await prisma.cyberPod.findUnique({ where: { id: cyberPodId } });
  if (!pod || !pod.isActive) {
    return { success: false, error: "Este espacio ya no está disponible" };
  }

  if (attendees > pod.capacity) {
    return {
      success: false,
      error: `Este pod tiene capacidad para ${pod.capacity} persona(s)`,
    };
  }

  // El precio se calcula en el servidor; nunca se toma del cliente
  const totalPrice = calculateReservationTotal(
    {
      hourlyRate: Number(pod.hourlyRate),
      discountedHourlyRate:
        pod.discountedHourlyRate != null ? Number(pod.discountedHourlyRate) : null,
      discountFromHours: pod.discountFromHours,
    },
    durationHours
  );

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.reservation.findFirst({
        where: {
          cyberPodId,
          ...blockingReservationWhere(),
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });

      if (overlapping) {
        throw new Error("SLOT_TAKEN");
      }

      return tx.reservation.create({
        data: {
          userId: session.user.id,
          cyberPodId,
          // PENDING hasta que el webhook de Stripe confirme el pago
          status: "PENDING",
          startTime: start,
          endTime: end,
          attendees,
          totalPrice,
          notes,
        },
      });
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "uyu",
            unit_amount: Math.round(totalPrice * 100),
            product_data: {
              name: `${pod.name} — ${durationHours}h`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email ?? undefined,
      metadata: { type: "reservation", reservationId: reservation.id },
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRES_MINUTES * 60,
      success_url: `${APP_URL}/coworking/confirm?reservation=${reservation.id}`,
      cancel_url: `${APP_URL}/coworking/${cyberPodId}`,
    });

    return { success: true, checkoutUrl: checkoutSession.url! };
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return {
        success: false,
        error: "Ese horario ya fue reservado. Elegí otro.",
      };
    }
    console.error("Error creando la reserva:", error);
    return {
      success: false,
      error: "Ocurrió un error al procesar tu reserva",
    };
  }
}

type CancelReservationResult =
  | { success: true; refunded: boolean }
  | { success: false; error: string };

// Cancela una reserva confirmada y reembolsa el pago completo en Stripe
export async function cancelReservation(
  reservationId: string
): Promise<CancelReservationResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Tenés que iniciar sesión" };
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { payment: true },
  });

  if (!reservation || reservation.userId !== session.user.id) {
    return { success: false, error: "No encontramos esa reserva" };
  }

  if (!canCancelReservation(reservation)) {
    return {
      success: false,
      error: `Solo se puede cancelar hasta ${CANCELLATION_NOTICE_HOURS} horas antes del inicio`,
    };
  }

  const payment = reservation.payment;
  if (!payment?.stripePaymentIntentId) {
    return {
      success: false,
      error: `No encontramos el pago de esta reserva. Escribinos a ${SITE.email}`,
    };
  }

  try {
    // La idempotency key evita un doble reembolso si se reintenta
    await stripe.refunds.create(
      { payment_intent: payment.stripePaymentIntentId },
      { idempotencyKey: `refund-reservation-${reservation.id}` }
    );

    await prisma.$transaction([
      prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: "CANCELLED" },
      }),
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      }),
    ]);

    return { success: true, refunded: true };
  } catch (error) {
    console.error("Error cancelando la reserva:", error);
    return {
      success: false,
      error: "No pudimos cancelar la reserva. Intentá de nuevo.",
    };
  }
}
