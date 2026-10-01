"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  try {
    // El webhook customer.subscription.deleted actualiza el estado local
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    return { success: true };
  } catch (error) {
    console.error("Error cancelando la suscripción:", error);
    return {
      success: false,
      error: "No pudimos cancelar la suscripción. Intentá de nuevo.",
    };
  }
}
