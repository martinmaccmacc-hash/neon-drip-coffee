import { z } from "zod";

// Zod valida la forma Y el contenido de los datos: no solo "esto es un
// string", sino "esto es un string que además es un email válido", con
// mensajes de error en español para mostrarle al usuario si algo falla.
export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Ingresá tu nombre completo"),
  customerEmail: z.string().email("Ingresá un email válido"),
  customerPhone: z.string().min(8, "Ingresá un teléfono de contacto"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "El carrito está vacío"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
