// Precio de reservas: función pura usada por el servidor (fuente de verdad) y por el cliente (estimación)

export type PodPricing = {
  hourlyRate: number;
  discountedHourlyRate?: number | null;
  discountFromHours?: number | null;
};

// Con descuento, la tarifa reducida aplica a todas las horas de la reserva
export function getHourlyRateFor(pod: PodPricing, durationHours: number): number {
  if (
    pod.discountedHourlyRate != null &&
    pod.discountFromHours != null &&
    durationHours >= pod.discountFromHours
  ) {
    return pod.discountedHourlyRate;
  }
  return pod.hourlyRate;
}

export function calculateReservationTotal(
  pod: PodPricing,
  durationHours: number
): number {
  return getHourlyRateFor(pod, durationHours) * durationHours;
}
