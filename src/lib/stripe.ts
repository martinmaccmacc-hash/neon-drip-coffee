import Stripe from "stripe";
import type { SubscriptionFrequency } from "@prisma/client";

// No fijamos "apiVersion" a propósito — las versiones recientes del SDK
// de Stripe ya vienen ancladas a una versión probada internamente, así
// que alcanza con pasar la clave secreta.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Traduce nuestra frecuencia (WEEKLY/BIWEEKLY/MONTHLY) al formato que
// espera Stripe para un precio recurrente: un intervalo base + cuántos
// de esos intervalos hay que esperar entre cobro y cobro.
export function toStripeRecurring(frequency: SubscriptionFrequency) {
  switch (frequency) {
    case "WEEKLY":
      return { interval: "week" as const, interval_count: 1 };
    case "BIWEEKLY":
      return { interval: "week" as const, interval_count: 2 };
    case "MONTHLY":
      return { interval: "month" as const, interval_count: 1 };
  }
}
