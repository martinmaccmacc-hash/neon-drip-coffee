import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type { GrindType, SubscriptionStatus } from "@prisma/client";

// Webhook de Stripe: valida la firma y sincroniza el estado de pedidos, suscripciones y reservas
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma de Stripe" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("Firma de webhook inválida:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Pago inicial confirmado (pedido y/o primer cobro de suscripción)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { orderId, userId, subscriptionPlanId, addressId, roastPreference, grindPreference } =
          session.metadata ?? {};

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        // --- Pedido (Click & Collect) ---
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          });

          await prisma.payment.create({
            data: {
              orderId,
              provider: "STRIPE",
              status: "SUCCEEDED",
              amount: (session.amount_total ?? 0) / 100,
              currency: (session.currency ?? "uyu").toUpperCase(),
              stripePaymentIntentId: paymentIntentId,
            },
          });
        }

        // --- Suscripción (Bean Deploy) ---
        if (session.mode === "subscription" && subscriptionPlanId && addressId && userId) {
          const stripeSubscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;

          if (stripeSubscriptionId) {
            const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            // En la API actual de Stripe el período vive en el primer item de la suscripción
            const item = stripeSub.items.data[0];

            await prisma.subscription.create({
              data: {
                userId,
                planId: subscriptionPlanId,
                addressId,
                roastPreference: (roastPreference as "LIGHT" | "MEDIUM" | "DARK") || null,
                grindPreference: (grindPreference as GrindType) || "WHOLE_BEAN",
                stripeSubscriptionId,
                status: "ACTIVE",
                currentPeriodStart: new Date(item.current_period_start * 1000),
                currentPeriodEnd: new Date(item.current_period_end * 1000),
              },
            });
          }
        }
        break;
      }

      // Renovación o cambio de estado de la suscripción
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const item = sub.items.data[0];

        const statusMap: Record<string, SubscriptionStatus> = {
          active: "ACTIVE",
          past_due: "PAST_DUE",
          unpaid: "PAST_DUE",
          canceled: "CANCELLED",
          paused: "PAUSED",
        };

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: statusMap[sub.status] ?? "ACTIVE",
            currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : undefined,
          },
        });
        break;
      }

      // Suscripción cancelada
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    // Se responde 200 para que Stripe no reintente el evento
    console.error("Error procesando el webhook de Stripe:", error);
  }

  return NextResponse.json({ received: true });
}
