"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelReservation } from "@/actions/reservation.actions";

export function CancelReservationButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setIsCancelling(true);
    setError(null);

    const result = await cancelReservation(reservationId);
    setIsCancelling(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  if (isConfirming) {
    return (
      <div className="space-y-2">
        <p className="font-mono text-xs text-neon-pink">
          ¿Cancelar la reserva? Te devolvemos el total a tu tarjeta.
        </p>
        {error && (
          <p role="alert" className="font-mono text-xs text-neon-pink">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isCancelling}
            className="rounded-lg bg-neon-pink px-3 py-1.5 font-mono text-xs font-semibold uppercase text-void disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCancelling ? "Cancelando..." : "Sí, cancelar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsConfirming(false);
              setError(null);
            }}
            disabled={isCancelling}
            className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs uppercase text-dim"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="font-mono text-xs uppercase text-dim underline transition-colors hover:text-neon-pink"
    >
      Cancelar reserva
    </button>
  );
}
