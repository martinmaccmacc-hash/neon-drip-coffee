"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

type CancelResult = { success: true } | { success: false; error: string };

export async function cancelSubscription(
  subscriptionId: string
): Promise<CancelResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Tenés que iniciar sesión" };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  // Verifica que la suscripción pertenezca al usuario
  if (!subscription || subscription.userId !== session.user.id) {
    return { success: false, error: "No encontramos esa suscripción" };
  }

  if (!subscription.stripeSubscriptionId) {
    return {
      success: false,
      error: "Esta suscripción no tiene un pago de Stripe asociado",
    };
  }

  if (subscription.status === "CANCELLED") {
    return { success: true };
  }

  const markCancelled = () =>
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

  try {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    // Se actualiza al instante; el webhook customer.subscription.deleted lo reconfirma
    await markCancelled();
    return { success: true };
  } catch (error) {
    console.error("Error cancelando la suscripción:", error);

    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      // Ya estaba cancelada en Stripe: se sincroniza el estado local
      const remote = await stripe.subscriptions
        .retrieve(subscription.stripeSubscriptionId)
        .catch(() => null);
      if (remote?.status === "canceled") {
        await markCancelled();
        return { success: true };
      }

      if (error.code === "resource_missing") {
        return {
          success: false,
          error:
            "Stripe no encuentra esta suscripción. Puede haberse creado con otra clave de Stripe (test/live o de otra cuenta).",
        };
      }
    }

    return {
      success: false,
      error: "No pudimos cancelar la suscripción. Intentá de nuevo.",
    };
  }
}
