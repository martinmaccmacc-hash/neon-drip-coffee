"use client";

import { useEffect, useState } from "react";
import { createReservation } from "@/actions/reservation.actions";
import { calculateReservationTotal, getHourlyRateFor } from "@/lib/coworking-pricing";
import { formatPrice } from "@/lib/utils";

const OPEN_HOUR = 8;
const CLOSE_HOUR = 22;
const DURATION_OPTIONS = [1, 2, 3, 4];

type BookedSlot = { startTime: string; endTime: string };

function toLocalDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

// `units`: unidades seleccionables cuando el pod pertenece a un grupo
export function BookingCalendar({
  pod,
  units,
}: {
  units?: { id: string; label: string }[];
  pod: {
    id: string;
    name: string;
    hourlyRate: number;
    capacity: number;
    discountedHourlyRate?: number | null;
    discountFromHours?: number | null;
  };
}) {
  const unitList = units && units.length > 0 ? units : [{ id: pod.id, label: pod.name }];
  const hasUnits = unitList.length > 1;

  const [selectedPodId, setSelectedPodId] = useState(pod.id);
  const [date, setDate] = useState(() => toLocalDateInputValue(new Date()));
  const [duration, setDuration] = useState(1);
  const [attendees, setAttendees] = useState(1);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [bookedByPod, setBookedByPod] = useState<Record<string, BookedSlot[]>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Disponibilidad de todas las unidades del grupo en paralelo
    async function fetchAvailability() {
      setIsLoadingSlots(true);
      setSelectedHour(null);
      try {
        const entries = await Promise.all(
          unitList.map(async (unit) => {
            const res = await fetch(
              `/api/availability?podId=${unit.id}&date=${date}`
            );
            const data = await res.json();
            return [unit.id, (data.reservations ?? []) as BookedSlot[]] as const;
          })
        );
        if (!cancelled) setBookedByPod(Object.fromEntries(entries));
      } catch {
        if (!cancelled) setBookedByPod({});
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    }

    fetchAvailability();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function isSlotFree(hour: number, podId: string = selectedPodId) {
    if (hour + duration > CLOSE_HOUR) return false;
    const bookedSlots = bookedByPod[podId] ?? [];

    const slotStart = new Date(
      `${date}T${String(hour).padStart(2, "0")}:00:00`
    );
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 60 * 1000);

    return !bookedSlots.some((slot) => {
      const bookedStart = new Date(slot.startTime);
      const bookedEnd = new Date(slot.endTime);
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });
  }

  const hourOptions = Array.from(
    { length: CLOSE_HOUR - OPEN_HOUR },
    (_, i) => OPEN_HOUR + i
  );

  async function handleSubmit() {
    if (selectedHour === null) {
      setError("Elegí un horario");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const startTime = new Date(
      `${date}T${String(selectedHour).padStart(2, "0")}:00:00`
    ).toISOString();

    const result = await createReservation({
      cyberPodId: selectedPodId,
      startTime,
      durationHours: duration,
      attendees,
    });

    if (!result.success) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    // Redirige a Stripe; el webhook confirma la reserva
    window.location.href = result.checkoutUrl;
  }

  const total = calculateReservationTotal(pod, duration);
  const appliedHourlyRate = getHourlyRateFor(pod, duration);
  const hasDiscount =
    pod.discountedHourlyRate != null && pod.discountFromHours != null;
  const discountApplied = hasDiscount && appliedHourlyRate === pod.discountedHourlyRate;

  const selectedUnit = unitList.find((u) => u.id === selectedPodId);

  return (
    <div className="space-y-5 rounded-xl border border-line bg-surface p-6">
      {hasUnits && (
        <div>
          <p id="unit-label" className="mb-2 font-mono text-xs text-dim">
            Elegí tu pod
          </p>
          <div
            role="group"
            aria-labelledby="unit-label"
            className="grid grid-cols-3 gap-2"
          >
            {unitList.map((unit) => {
              const busyAtHour =
                selectedHour !== null && !isSlotFree(selectedHour, unit.id);
              const isSelected = unit.id === selectedPodId;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => {
                    setSelectedPodId(unit.id);
                    if (busyAtHour) setSelectedHour(null);
                  }}
                  aria-pressed={isSelected}
                  title={busyAtHour ? "Ocupado en ese horario" : undefined}
                  className={`rounded-lg border px-2 py-2 font-mono text-xs transition-colors ${
                    isSelected
                      ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                      : busyAtHour
                        ? "border-line text-dim/40 line-through hover:text-dim"
                        : "border-line text-dim hover:border-neon-cyan/50 hover:text-ink"
                  }`}
                >
                  {unit.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1 font-mono text-xs text-dim">
            Los {unitList.length} pods tienen el mismo equipamiento.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="booking-date"
          className="mb-1 block font-mono text-xs text-dim"
        >
          Fecha
        </label>
        <input
          id="booking-date"
          type="date"
          value={date}
          min={toLocalDateInputValue(new Date())}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
        />
      </div>

      <div>
        <label
          htmlFor="booking-duration"
          className="mb-1 block font-mono text-xs text-dim"
        >
          Duración
        </label>
        <select
          id="booking-duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
        >
          {DURATION_OPTIONS.map((h) => (
            <option key={h} value={h}>
              {h} {h === 1 ? "hora" : "horas"}
            </option>
          ))}
        </select>
        {hasDiscount && (
          <p className="mt-1 font-mono text-xs text-neon-pink">
            {discountApplied
              ? `✓ Tarifa aplicada: ${formatPrice(pod.discountedHourlyRate!)}/hora (reserva de ${pod.discountFromHours}hs o más)`
              : `A partir de ${pod.discountFromHours}hs: ${formatPrice(pod.discountedHourlyRate!)}/hora`}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="booking-attendees"
          className="mb-1 block font-mono text-xs text-dim"
        >
          Personas (máx. {pod.capacity})
        </label>
        <input
          id="booking-attendees"
          type="number"
          min={1}
          max={pod.capacity}
          value={attendees}
          onChange={(e) => setAttendees(Number(e.target.value))}
          className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
        />
      </div>

      <div>
        <p id="hour-label" className="mb-2 font-mono text-xs text-dim">
          Horario disponible
        </p>
        {isLoadingSlots ? (
          <p className="font-mono text-xs text-dim">Cargando horarios...</p>
        ) : (
          <>
            <div
              role="group"
              aria-labelledby="hour-label"
              className="grid grid-cols-4 gap-2"
            >
              {hourOptions.map((hour) => {
                const free = isSlotFree(hour);
                return (
                  <button
                    key={hour}
                    type="button"
                    disabled={!free}
                    onClick={() => setSelectedHour(hour)}
                    aria-pressed={selectedHour === hour}
                    className={`rounded-lg border px-2 py-2 font-mono text-xs transition-colors ${
                      !free
                        ? "cursor-not-allowed border-line text-dim/40 line-through"
                        : selectedHour === hour
                          ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                          : "border-line text-dim hover:border-neon-cyan/50 hover:text-ink"
                    }`}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </button>
                );
              })}
            </div>
            {hasUnits && (
              <p className="mt-2 font-mono text-xs text-dim">
                Mostrando horarios de{" "}
                <span className="text-neon-cyan">{selectedUnit?.label}</span>.
                Si el que buscás está tachado, probá con otro pod.
              </p>
            )}
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="font-mono text-sm text-neon-pink">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="font-mono text-xs text-dim">Total</span>
        <span className="font-display text-xl font-bold text-neon-cyan">
          {formatPrice(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full rounded-lg bg-neon-purple py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-[1.02] hover:bg-neon-pink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Redirigiendo a Stripe..." : "Reservar y pagar"}
      </button>
    </div>
  );
}
