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

  // Chequeo de seguridad clave: nos aseguramos de que la suscripción sea
  // REALMENTE del usuario logueado — sin esto, cualquiera podría intentar
  // cancelar la suscripción de otra persona adivinando o armando un id.
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
    // Cancelamos directo en Stripe — el webhook
    // "customer.subscription.deleted" que ya armamos se encarga de
    // actualizar nuestro estado automáticamente cuando Stripe confirme.
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
