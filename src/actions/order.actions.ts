"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order.schema";
import type { SubscriptionFrequency } from "@prisma/client";

type CreateOrderResult =
  | { success: true; checkoutUrl: string | null; subscriptionCreated: boolean }
  | { success: false; error: string };

function addInterval(date: Date, frequency: SubscriptionFrequency): Date {
  const result = new Date(date);
  if (frequency === "WEEKLY") result.setDate(result.getDate() + 7);
  if (frequency === "BIWEEKLY") result.setDate(result.getDate() + 14);
  if (frequency === "MONTHLY") result.setMonth(result.getMonth() + 1);
  return result;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createOrder(
  input: CheckoutInput
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { customerName, customerEmail, customerPhone, notes, items, subscription } =
    parsed.data;

  const session = await auth();

  if (subscription && !session?.user) {
    return {
      success: false,
      error: "Tu sesión expiró. Iniciá sesión de nuevo para completar la suscripción.",
    };
  }

  try {
    let userId: string;

    if (session?.user) {
      userId = session.user.id;
      await prisma.user.update({
        where: { id: userId },
        data: { phone: customerPhone },
      });
    } else {
      const user = await prisma.user.upsert({
        where: { email: customerEmail },
        update: { name: customerName, phone: customerPhone },
        create: {
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
        },
      });
      userId = user.id;
    }

    // --- Suscripción (Bean Deploy): sigue activándose directo por ahora,
    // sin pasar por Stripe todavía — eso queda para la Fase 2, con Stripe
    // Billing (facturación recurrente real). ---
    let subscriptionCreated = false;
    let subscriptionPlanName: string | null = null;

    if (subscription) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: subscription.planId },
      });

      if (!plan || !plan.isActive) {
        return {
          success: false,
          error: "El plan de suscripción ya no está disponible",
        };
      }

      const savedAddress = await prisma.address.create({
        data: {
          userId,
          street: subscription.address.street,
          number: subscription.address.number,
          city: subscription.address.city,
          state: subscription.address.state,
          zipCode: subscription.address.zipCode,
          latitude: subscription.address.latitude,
          longitude: subscription.address.longitude,
          isDefault: true,
        },
      });

      const now = new Date();

      await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          addressId: savedAddress.id,
          roastPreference: subscription.roastPreference,
          grindPreference: subscription.grindPreference,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: addInterval(now, plan.frequency),
        },
      });

      subscriptionCreated = true;
      subscriptionPlanName = plan.name;
    }

    // --- Productos (Click & Collect): ahora sí pasan por Stripe. ---
    let checkoutUrl: string | null = null;

    if (items.length > 0) {
      // Nunca confiamos en el precio del navegador — recalculamos desde
      // la base de datos.
      const variantIds = items.map((item) => item.variantId);
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
        include: { product: { select: { name: true } } },
      });

      if (variants.length !== variantIds.length) {
        return {
          success: false,
          error: "Alguno de los productos ya no está disponible",
        };
      }

      const orderItemsData = items.map((item) => {
        const variant = variants.find((v) => v.id === item.variantId)!;
        const unitPrice = Number(variant.price);
        return {
          productId: variant.productId,
          productVariantId: variant.id,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      });

      const total = orderItemsData.reduce((sum, item) => sum + item.subtotal, 0);
      const generatedOrderNumber = `ND-${Date.now().toString(36).toUpperCase()}`;

      // El pedido nace en PENDING — recién pasa a PAID cuando llegue el
      // webhook de Stripe confirmando el cobro.
      const order = await prisma.order.create({
        data: {
          orderNumber: generatedOrderNumber,
          userId,
          status: "PENDING",
          subtotal: total,
          total,
          pickupEta: new Date(Date.now() + 10 * 60 * 1000),
          notes,
          items: { create: orderItemsData },
        },
      });

      const successParams = new URLSearchParams({ order: order.orderNumber });
      if (subscriptionPlanName) {
        successParams.set("subscriptionPlan", subscriptionPlanName);
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: items.map((item) => {
          const variant = variants.find((v) => v.id === item.variantId)!;
          return {
            price_data: {
              currency: "uyu",
              unit_amount: Math.round(Number(variant.price) * 100),
              product_data: {
                name: `${variant.product.name} (${variant.name})`,
              },
            },
            quantity: item.quantity,
          };
        }),
        customer_email: customerEmail,
        // Este metadata es lo único que necesitamos para que el webhook
        // sepa qué actualizar cuando el pago se confirme.
        metadata: { type: "order", orderId: order.id },
        success_url: `${APP_URL}/checkout/success?${successParams.toString()}`,
        cancel_url: `${APP_URL}/checkout`,
      });

      checkoutUrl = checkoutSession.url;
    }

    return { success: true, checkoutUrl, subscriptionCreated };
  } catch (error) {
    console.error("Error procesando el checkout:", error);
    return {
      success: false,
      error: "Ocurrió un error al procesar tu pedido. Intentá de nuevo.",
    };
  }
}
