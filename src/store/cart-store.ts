"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  sku: string;
  quantity: number;
};

export type SubscriptionSelection = {
  planId: string;
  planName: string;
  frequencyLabel: string;
  price: number;
  roastPreference: "LIGHT" | "MEDIUM" | "DARK" | null;
  grindPreference: "WHOLE_BEAN" | "ESPRESSO" | "FILTER" | "FRENCH_PRESS" | "MOKA";
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    // Solo si la dirección vino del buscador (Mapbox)
    latitude?: number;
    longitude?: number;
  };
};

type CartState = {
  items: CartItem[];
  pendingSubscription: SubscriptionSelection | null;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (variantId: string) => void;
  incrementItem: (variantId: string) => void;
  decrementItem: (variantId: string) => void;
  setSubscription: (sub: SubscriptionSelection) => void;
  clearSubscription: () => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      pendingSubscription: null,
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }

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
          set({ items: get().items.filter((i) => i.variantId !== variantId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.variantId === variantId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        }
      },

      setSubscription: (sub) => set({ pendingSubscription: sub, isOpen: true }),

      clearSubscription: () => set({ pendingSubscription: null }),

      clearCart: () => set({ items: [], pendingSubscription: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: "neon-drip-cart",
    }
  )
);

export function useCartItemCount() {
  return useCartStore((state) => {
    const productCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    return productCount + (state.pendingSubscription ? 1 : 0);
  });
}

export function useCartTotal() {
  return useCartStore((state) => {
    const productsTotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const subscriptionPrice = state.pendingSubscription
      ? state.pendingSubscription.price
      : 0;
    return productsTotal + subscriptionPrice;
  });
}
