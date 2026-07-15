"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// La forma de cada producto agregado al carrito. Guardamos una "foto" de
// sus datos (nombre, precio, sku) en vez de solo el id — así, si el precio
// de un producto cambia después en la base de datos, los pedidos ya hechos
// no se ven afectados retroactivamente.
export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  sku: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (variantId: string) => void;
  incrementItem: (variantId: string) => void;
  decrementItem: (variantId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);

        if (existing) {
          // Ya está en el carrito: solo le sumamos 1 a la cantidad.
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          // Es nuevo: lo agregamos con cantidad 1.
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }

        // Abrimos el carrito automáticamente para dar feedback visual
        // de que "sí, se agregó" — mejor que un simple toast que desaparece.
        set({ isOpen: true });
      },

      removeItem: (variantId) =>
        set({ items: get().items.filter((i) => i.variantId !== variantId) }),

      incrementItem: (variantId) =>
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }),

      decrementItem: (variantId) => {
        const item = get().items.find((i) => i.variantId === variantId);
        if (item && item.quantity <= 1) {
          // Si iba a quedar en 0, directamente lo sacamos del carrito.
          set({ items: get().items.filter((i) => i.variantId !== variantId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.variantId === variantId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      // Nombre de la clave dentro de localStorage. Podés abrir las
      // DevTools del navegador (F12) -> pestaña "Application" ->
      // "Local Storage" para ver este dato guardado ahí en vivo.
      name: "neon-drip-cart",
    }
  )
);

// Selectores auxiliares: en vez de traer TODO el carrito y calcular estas
// cosas en cada componente, las centralizamos acá. Componentes como el
// ícono del carrito en el navbar solo necesitan "cuántos items hay", no
// la lista completa.
export function useCartItemCount() {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
}

export function useCartTotal() {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
}
