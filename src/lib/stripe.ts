import Stripe from "stripe";
import type { SubscriptionFrequency } from "@prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Frecuencia de suscripción → intervalo de cobro de Stripe
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
