"use server";

import type Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, toStripeRecurring } from "@/lib/stripe";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order.schema";
import { SITE_URL } from "@/lib/site-config";

type CreateOrderResult =
  | { success: true; checkoutUrl: string }
  | { success: false; error: string };

const APP_URL = SITE_URL;

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
    let userEmail: string;

    if (session?.user) {
      userId = session.user.id;
      userEmail = session.user.email!;
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
      userEmail = user.email;
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    let order: { id: string; orderNumber: string } | null = null;

    // --- Productos (Click & Collect) ---
    if (items.length > 0) {
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

      const createdOrder = await prisma.order.create({
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

      order = { id: createdOrder.id, orderNumber: createdOrder.orderNumber };

      for (const item of items) {
        const variant = variants.find((v) => v.id === item.variantId)!;
        lineItems.push({
          price_data: {
            currency: "uyu",
            unit_amount: Math.round(Number(variant.price) * 100),
            product_data: { name: `${variant.product.name} (${variant.name})` },
          },
          quantity: item.quantity,
        });
      }
    }

    // --- Suscripción (Bean Deploy) ---
    let addressId: string | null = null;
    let planName: string | null = null;

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

      addressId = savedAddress.id;
      planName = plan.name;

      lineItems.push({
        price_data: {
          currency: "uyu",
          unit_amount: Math.round(Number(plan.price) * 100),
          recurring: toStripeRecurring(plan.frequency),
          product_data: { name: `Bean Deploy — ${plan.name}` },
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      return { success: false, error: "No hay nada para procesar" };
    }

    // Reutiliza el customer de Stripe del usuario (requerido para suscripciones)
    let stripeCustomerId: string | null = null;

    if (subscription) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      stripeCustomerId = user?.stripeCustomerId ?? null;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          name: customerName,
          metadata: { userId },
        });
        stripeCustomerId = customer.id;
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId },
        });
      }
    }

    const successParams = new URLSearchParams();
    if (order) successParams.set("order", order.orderNumber);
    if (planName) successParams.set("subscriptionPlan", planName);

    const checkoutSession = await stripe.checkout.sessions.create({
      // Con suscripción, la sesión es de tipo subscription (admite también ítems únicos)
      mode: subscription ? "subscription" : "payment",
      customer: stripeCustomerId ?? undefined,
      customer_email: stripeCustomerId ? undefined : customerEmail,
      line_items: lineItems,
      // Datos que usa el webhook para crear o actualizar registros al confirmar el pago
      metadata: {
        orderId: order?.id ?? "",
        userId,
        subscriptionPlanId: subscription?.planId ?? "",
        addressId: addressId ?? "",
        roastPreference: subscription?.roastPreference ?? "",
        grindPreference: subscription?.grindPreference ?? "",
      },
      success_url: `${APP_URL}/checkout/success?${successParams.toString()}`,
      cancel_url: `${APP_URL}/checkout`,
    });

    return { success: true, checkoutUrl: checkoutSession.url! };
  } catch (error) {
    console.error("Error procesando el checkout:", error);
    return {
      success: false,
      error: "Ocurrió un error al procesar tu pedido. Intentá de nuevo.",
    };
  }
}
