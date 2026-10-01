import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/availability?podId=&date= → reservas del pod para ese día
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

  // Margen de ±1 día: el cliente calcula el solapamiento exacto en su zona horaria
  const DAY_MS = 24 * 60 * 60 * 1000;
  const dayStart = new Date(new Date(`${date}T00:00:00Z`).getTime() - DAY_MS);
  const dayEnd = new Date(new Date(`${date}T23:59:59Z`).getTime() + DAY_MS);

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
