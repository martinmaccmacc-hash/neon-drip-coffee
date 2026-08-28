"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

// La página de éxito es un Server Component, así que necesita este
// pequeño Client Component aparte para poder tocar el store de Zustand.
// Solo se usa cuando estamos SEGUROS de que el pedido se procesó bien —
// nunca antes, para no perder el carrito de alguien que canceló en Stripe.
export function ClearCartOnMount() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
    // Solo queremos que corra una vez, al montar el componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
