"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore, useCartTotal } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/actions/order.actions";

export default function CheckoutPage() {
  const { data: session } = useSession();

  const items = useCartStore((s) => s.items);
  const pendingSubscription = useCartStore((s) => s.pendingSubscription);
  const total = useCartTotal();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || session.user?.name || "",
        customerEmail: prev.customerEmail || session.user?.email || "",
      }));
    }
  }, [session]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createOrder({
      ...form,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      subscription: pendingSubscription
        ? {
            planId: pendingSubscription.planId,
            roastPreference: pendingSubscription.roastPreference,
            grindPreference: pendingSubscription.grindPreference,
            address: pendingSubscription.address,
          }
        : null,
    });

    if (!result.success) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    // Ahora TODO pasa por Stripe — productos, suscripción, o ambos juntos
    // en la misma pantalla de pago. El carrito recién se limpia en la
    // pantalla de éxito, una vez que Stripe confirma (ver ClearCartOnMount).
    window.location.href = result.checkoutUrl;
  }

  if (items.length === 0 && !pendingSubscription) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-void px-6 text-center">
        <p className="font-mono text-dim">Tu carrito está vacío.</p>
        <Link
          href="/menu"
          className="rounded-lg bg-neon-purple px-4 py-2 font-mono text-xs uppercase tracking-wide text-void"
        >
          Ver el menú
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <section>
          <p className="font-mono text-sm text-neon-cyan">{"// checkout.tsx"}</p>
          <h1 className="mt-2 mb-6 font-display text-2xl font-bold text-ink">
            Resumen del pedido
          </h1>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex justify-between gap-4 border-b border-line pb-3 font-mono text-sm"
              >
                <span className="text-dim">
                  {item.quantity}x {item.productName}{" "}
                  <span className="text-xs">({item.variantName})</span>
                </span>
                <span className="shrink-0 text-ink">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}

            {pendingSubscription && (
              <div className="flex justify-between gap-4 border-b border-line pb-3 font-mono text-sm">
                <span className="text-dim">
                  <span className="text-neon-purple">[Suscripción]</span>{" "}
                  {pendingSubscription.planName}{" "}
                  <span className="text-xs">
                    ({pendingSubscription.frequencyLabel})
                  </span>
                </span>
                <span className="shrink-0 text-ink">
                  {formatPrice(pendingSubscription.price)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between font-display text-xl font-bold">
            <span className="text-ink">Total de hoy</span>
            <span className="text-neon-cyan">{formatPrice(total)}</span>
          </div>

          {pendingSubscription && (
            <p className="mt-4 font-mono text-xs text-dim">
              La suscripción se cobra automáticamente{" "}
              {pendingSubscription.frequencyLabel.toLowerCase()} desde tu
              tarjeta, a partir de hoy.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-6 font-display text-2xl font-bold text-ink">
            Tus datos
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Nombre completo"
              value={form.customerName}
              onChange={(v) => setForm({ ...form, customerName: v })}
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.customerEmail}
              onChange={(v) => setForm({ ...form, customerEmail: v })}
              required
            />
            <Field
              label="Teléfono"
              value={form.customerPhone}
              onChange={(v) => setForm({ ...form, customerPhone: v })}
              required
            />
            <div>
              <label className="mb-1 block font-mono text-xs text-dim">
                Notas (opcional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Ej: sin azúcar, alergia a frutos secos, etc."
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-dim/60 focus:border-neon-cyan"
              />
            </div>

            {error && (
              <p className="font-mono text-sm text-neon-pink">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-neon-purple py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-[1.02] hover:bg-neon-pink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Redirigiendo a Stripe..." : "Continuar"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-xs text-dim">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
      />
    </div>
  );
}
