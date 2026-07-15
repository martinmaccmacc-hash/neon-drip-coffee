// Utilidades compartidas por toda la app.

// Formatea un número como precio en pesos uruguayos.
// Ejemplo: formatPrice(190) -> "$ 190"
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
