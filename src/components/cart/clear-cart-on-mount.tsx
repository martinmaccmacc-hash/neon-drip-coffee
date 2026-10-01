"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

// Vacía el carrito al montar (solo en la página de pago exitoso)
export function ClearCartOnMount() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
