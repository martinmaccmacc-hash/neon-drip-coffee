import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/availability?podId=xxx&date=2026-08-15
// Devuelve las reservas existentes de ese pod para ese día, para que el
// calendario del cliente sepa qué horarios tachar. Es un Route Handler
// (no un Server Action) porque el calendario necesita volver a pedirlo
// dinámicamente cada vez que el usuario cambia de fecha — es un GET
// típico, no una mutación disparada por un formulario.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const podId = searchParams.get("podId");
  const date = searchParams.get("date");

  if (!podId || !date) {
    return NextResponse.json(
      { error: "Faltan los parámetros podId y date" },
      { status: 400 }
    );
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const reservations = await prisma.reservation.findMany({
    where: {
      cyberPodId: podId,
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      startTime: { lt: dayEnd },
      endTime: { gt: dayStart },
    },
    select: { startTime: true, endTime: true },
  });

  return NextResponse.json({ reservations });
}
