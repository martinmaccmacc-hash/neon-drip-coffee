"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  reservationSchema,
  type ReservationInput,
} from "@/lib/validations/reservation.schema";

type CreateReservationResult =
  | { success: true; checkoutUrl: string }
  | { success: false; error: string };

const BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"] as const;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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

      const totalPrice = Number(pod.hourlyRate) * durationHours;

      return tx.reservation.create({
        data: {
          userId: session.user.id,
          cyberPodId,
          // Ahora arranca en PENDING — recién pasa a CONFIRMED cuando
          // Stripe confirma el pago, vía webhook.
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
            unit_amount: Math.round(Number(pod.hourlyRate) * durationHours * 100),
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
