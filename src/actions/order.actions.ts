"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order.schema";
import type { SubscriptionFrequency } from "@prisma/client";

type CreateOrderResult =
  | { success: true; orderNumber: string | null; subscriptionCreated: boolean }
  | { success: false; error: string };

function addInterval(date: Date, frequency: SubscriptionFrequency): Date {
  const result = new Date(date);
  if (frequency === "WEEKLY") result.setDate(result.getDate() + 7);
  if (frequency === "BIWEEKLY") result.setDate(result.getDate() + 14);
  if (frequency === "MONTHLY") result.setMonth(result.getMonth() + 1);
  return result;
}

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

    let orderNumber: string | null = null;

    if (items.length > 0) {
      const variantIds = items.map((item) => item.variantId);
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
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

      await prisma.order.create({
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

      orderNumber = generatedOrderNumber;
    }

    let subscriptionCreated = false;

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
          // Solo vienen si el usuario usó el buscador con mapa — si
          // completó los campos a mano, quedan en null y no pasa nada,
          // el mapa es un lindo extra, no un requisito.
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
    }

    return { success: true, orderNumber, subscriptionCreated };
  } catch (error) {
    console.error("Error procesando el checkout:", error);
    return {
      success: false,
      error: "Ocurrió un error al procesar tu pedido. Intentá de nuevo.",
    };
  }
}
