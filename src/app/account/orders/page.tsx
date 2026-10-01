import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { TIME_ZONE } from "@/lib/site-config";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  PREPARING: "En preparación",
  READY_FOR_PICKUP: "Listo para retirar",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">{"// account/orders"}</p>
      <h1 className="mt-2 mb-8 font-display text-2xl font-bold text-ink">
        Tus pedidos
      </h1>

      {orders.length === 0 ? (
        <p className="font-mono text-sm text-dim">
          Todavía no hiciste ningún pedido de Click & Collect.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-dim">
                  #{order.orderNumber}
                </span>
                <span className="font-mono text-xs uppercase text-neon-pink">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-dim">
                {order.createdAt.toLocaleDateString("es-UY", {
                  timeZone: TIME_ZONE,
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <div className="mt-4 space-y-1 border-t border-line pt-4">
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

              <div className="mt-3 flex justify-between border-t border-line pt-3 font-display text-lg font-bold">
                <span className="text-ink">Total</span>
                <span className="text-neon-cyan">
                  {formatPrice(Number(order.total))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
