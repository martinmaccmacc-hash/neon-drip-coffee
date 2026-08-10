import { z } from "zod";

export const reservationSchema = z.object({
  cyberPodId: z.string(),
  startTime: z.string().datetime(), // ISO string, ej: "2026-08-15T14:00:00.000Z"
  durationHours: z.number().int().min(1).max(4),
  attendees: z.number().int().min(1),
  notes: z.string().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
