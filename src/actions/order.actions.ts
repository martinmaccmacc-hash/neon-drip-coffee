"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order.schema";

type CreateOrderResult =
  | { success: true; orderNumber: string }
  | { success: false; error: string };

export async function createOrder(
  input: CheckoutInput
): Promise<CreateOrderResult> {
  // 1. Validamos lo que llegó, sin confiar ciegamente en el navegador.
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { customerName, customerEmail, customerPhone, notes, items } =
    parsed.data;

  try {
    // 2. Checkout como invitado: buscamos un usuario con ese email, o lo
    // creamos si es la primera vez que compra. Todavía no hay login real
    // (eso lo resolvemos más adelante con Auth.js).
    const user = await prisma.user.upsert({
      where: { email: customerEmail },
      update: { name: customerName, phone: customerPhone },
      create: {
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
      },
    });

    // 3. Traemos los precios REALES desde la base de datos — nunca
    // confiamos en el precio que venga calculado del lado del navegador,
    // aunque el carrito ya lo muestre. Alguien podría manipularlo.
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

    // Código de pedido legible, ej: "ND-M3X9K2"
    const orderNumber = `ND-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        // Sin pasarela de pago conectada todavía, el pedido queda como
        // PENDING. Cuando integremos Stripe, un webhook va a actualizar
        // este status a PAID automáticamente al confirmarse el cobro.
        status: "PENDING",
        subtotal: total,
        total,
        pickupEta: new Date(Date.now() + 10 * 60 * 1000), // +10 minutos
        notes,
        items: { create: orderItemsData },
      },
    });

    return { success: true, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("Error creando la orden:", error);
    return {
      success: false,
      error: "Ocurrió un error al procesar tu pedido. Intentá de nuevo.",
    };
  }
}
