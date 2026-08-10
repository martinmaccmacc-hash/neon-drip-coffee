"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createReservation } from "@/actions/reservation.actions";
import { formatPrice } from "@/lib/utils";

// Horario de atención fijo, ya que todavía no tenemos ese dato en el
// modelo de CyberPod — se podría mover a la base de datos más adelante.
const OPEN_HOUR = 8;
const CLOSE_HOUR = 22;
const DURATION_OPTIONS = [1, 2, 3, 4];

type BookedSlot = { startTime: string; endTime: string };

function toLocalDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function BookingCalendar({
  pod,
}: {
  pod: { id: string; name: string; hourlyRate: number; capacity: number };
}) {
  const router = useRouter();
  const [date, setDate] = useState(() => toLocalDateInputValue(new Date()));
  const [duration, setDuration] = useState(1);
  const [attendees, setAttendees] = useState(1);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que cambia la fecha, le preguntamos a /api/availability qué
  // horarios ya están ocupados ese día para este pod puntual.
  useEffect(() => {
    let cancelled = false;

    async function fetchAvailability() {
      setIsLoadingSlots(true);
      setSelectedHour(null);
      try {
        const res = await fetch(
          `/api/availability?podId=${pod.id}&date=${date}`
        );
        const data = await res.json();
        if (!cancelled) setBookedSlots(data.reservations ?? []);
      } catch {
        if (!cancelled) setBookedSlots([]);
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    }

    fetchAvailability();
    return () => {
      cancelled = true;
    };
  }, [date, pod.id]);

  function isSlotFree(hour: number) {
    // La reserva tiene que terminar dentro del horario de atención.
    if (hour + duration > CLOSE_HOUR) return false;

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
      cyberPodId: pod.id,
      startTime,
      durationHours: duration,
      attendees,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/coworking/confirm?reservation=${result.reservationId}`);
  }

  const total = pod.hourlyRate * duration;

  return (
    <div className="space-y-5 rounded-xl border border-line bg-surface p-6">
      <div>
        <label className="mb-1 block font-mono text-xs text-dim">
          Fecha
        </label>
        <input
          type="date"
          value={date}
          min={toLocalDateInputValue(new Date())}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
        />
      </div>

      <div>
        <label className="mb-1 block font-mono text-xs text-dim">
          Duración
        </label>
        <select
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
      </div>

      <div>
        <label className="mb-1 block font-mono text-xs text-dim">
          Personas (máx. {pod.capacity})
        </label>
        <input
          type="number"
          min={1}
          max={pod.capacity}
          value={attendees}
          onChange={(e) => setAttendees(Number(e.target.value))}
          className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
        />
      </div>

      <div>
        <label className="mb-2 block font-mono text-xs text-dim">
          Horario disponible
        </label>
        {isLoadingSlots ? (
          <p className="font-mono text-xs text-dim">Cargando horarios...</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {hourOptions.map((hour) => {
              const free = isSlotFree(hour);
              return (
                <button
                  key={hour}
                  type="button"
                  disabled={!free}
                  onClick={() => setSelectedHour(hour)}
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
        )}
      </div>

      {error && <p className="font-mono text-sm text-neon-pink">{error}</p>}

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
        {isSubmitting ? "Reservando..." : "Confirmar reserva"}
      </button>
    </div>
  );
}
