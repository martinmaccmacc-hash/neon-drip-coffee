import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Este endpoint lo llama STRIPE, no tu navegador. Por eso valida la
// "firma" del pedido (stripe-signature) contra STRIPE_WEBHOOK_SECRET —
// así confirmamos que el aviso realmente viene de Stripe, y no de
// cualquiera que le pegue a esta URL haciéndose pasar por Stripe.
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { type, orderId, reservationId } = session.metadata ?? {};

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    try {
      if (type === "order" && orderId) {
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

      if (type === "reservation" && reservationId) {
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { status: "CONFIRMED" },
        });

        await prisma.payment.create({
          data: {
            reservationId,
            provider: "STRIPE",
            status: "SUCCEEDED",
            amount: (session.amount_total ?? 0) / 100,
            currency: (session.currency ?? "uyu").toUpperCase(),
            stripePaymentIntentId: paymentIntentId,
          },
        });
      }
    } catch (error) {
      // Devolvemos 200 igual: si le devolviéramos un error a Stripe,
      // reintentaría este mismo evento más tarde. Preferimos loguear acá
      // y revisar a mano si pasa algo raro, en vez de generar reintentos
      // en cadena.
      console.error("Error procesando el webhook de Stripe:", error);
    }
  }

  return NextResponse.json({ received: true });
}
