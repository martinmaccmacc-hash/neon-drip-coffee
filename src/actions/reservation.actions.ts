"use server";

import type { ReservationStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { calculateReservationTotal } from "@/lib/coworking-pricing";
import {
  reservationSchema,
  type ReservationInput,
} from "@/lib/validations/reservation.schema";
import { SITE_URL } from "@/lib/site-config";

type CreateReservationResult =
  | { success: true; checkoutUrl: string }
  | { success: false; error: string };

const BLOCKING_STATUSES: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
];
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
          status: { in: BLOCKING_STATUSES },
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
