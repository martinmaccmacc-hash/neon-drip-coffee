"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  reservationSchema,
  type ReservationInput,
} from "@/lib/validations/reservation.schema";

type CreateReservationResult =
  | { success: true; reservationId: string }
  | { success: false; error: string };

// Estados que "ocupan" el horario — una reserva CANCELLED o NO_SHOW no
// debería bloquear ese espacio para otra persona.
const BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"] as const;

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
    // Transacción: chequeamos solapamiento y creamos la reserva como una
    // sola operación atómica, para minimizar la ventana de riesgo de que
    // dos personas reserven el mismo horario casi al mismo tiempo.
    const reservation = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.reservation.findFirst({
        where: {
          cyberPodId,
          status: { in: BLOCKING_STATUSES },
          // Condición clásica de solapamiento de rangos de tiempo:
          // el existente empieza antes de que el nuevo termine, Y
          // el existente termina después de que el nuevo empieza.
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
          // Sin Stripe conectado todavía, confirmamos directo — igual que
          // hicimos con las suscripciones.
          status: "CONFIRMED",
          startTime: start,
          endTime: end,
          attendees,
          totalPrice,
          notes,
        },
      });
    });

    return { success: true, reservationId: reservation.id };
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
