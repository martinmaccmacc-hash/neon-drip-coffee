import { z } from "zod";

const subscriptionInCheckoutSchema = z.object({
  planId: z.string(),
  roastPreference: z.enum(["LIGHT", "MEDIUM", "DARK"]).nullable(),
  grindPreference: z.enum([
    "WHOLE_BEAN",
    "ESPRESSO",
    "FILTER",
    "FRENCH_PRESS",
    "MOKA",
  ]),
  address: z.object({
    street: z.string().min(2),
    number: z.string().min(1),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(4),
    // Solo si la dirección se eligió con el buscador
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const checkoutSchema = z
  .object({
    customerName: z.string().min(2, "Ingresá tu nombre completo"),
    customerEmail: z.string().email("Ingresá un email válido"),
    customerPhone: z.string().min(8, "Ingresá un teléfono de contacto"),
    notes: z.string().optional(),
    items: z.array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      })
    ),
    subscription: subscriptionInCheckoutSchema.nullable().optional(),
  })
  .refine((data) => data.items.length > 0 || !!data.subscription, {
    message: "El carrito está vacío",
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
