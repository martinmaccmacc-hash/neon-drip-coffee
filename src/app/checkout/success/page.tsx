import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

// Nota sobre `searchParams`: en versiones recientes de Next.js, este prop
// llega como una Promise (no como un objeto directo) — por eso hay que
// hacerle `await`. Es un cambio de la propia versión de Next.js que
// estamos usando, no algo que hayamos decidido nosotros.
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  if (!orderNumber) {
    return <EmptyState message="No encontramos ningún pedido para mostrar." />;
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      user: true,
      items: { include: { product: true, productVariant: true } },
    },
  });

  if (!order) {
    return (
      <EmptyState message={`No encontramos el pedido #${orderNumber}.`} />
    );
  }

  const pickupTime = order.pickupEta
    ? new Date(order.pickupEta).toLocaleTimeString("es-UY", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-void px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-neon-cyan/40 bg-surface p-8 text-center">
        <p className="font-mono text-sm text-neon-cyan">// pedido confirmado</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          ¡Gracias, {order.user.name.split(" ")[0]}!
        </h1>
        <p className="mt-2 font-mono text-xs text-dim">#{order.orderNumber}</p>

        {pickupTime && (
          <p className="mt-4 font-mono text-sm text-dim">
            Retirá tu pedido en barra alrededor de las{" "}
            <span className="text-neon-pink">{pickupTime}</span>
          </p>
        )}

        <div className="mt-6 space-y-2 border-t border-line pt-6 text-left">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between font-mono text-sm"
            >
              <span className="text-dim">
                {item.quantity}x {item.product.name}
              </span>
              <span className="text-ink">
                {formatPrice(Number(item.subtotal))}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-line pt-4 font-display text-lg font-bold">
          <span className="text-ink">Total</span>
          <span className="text-neon-cyan">{formatPrice(Number(order.total))}</span>
        </div>

        <Link
          href="/menu"
          className="mt-8 inline-block rounded-lg bg-neon-purple px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
        >
          Volver al menú
        </Link>
      </div>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-void px-6 text-center">
      <p className="font-mono text-dim">{message}</p>
      <Link
        href="/menu"
        className="rounded-lg bg-neon-purple px-4 py-2 font-mono text-xs uppercase tracking-wide text-void"
      >
        Ver el menú
      </Link>
    </main>
  );
}
