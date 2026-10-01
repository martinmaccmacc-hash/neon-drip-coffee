// Datos del negocio (ficticios) usados en el footer, la home y los datos estructurados.
// Los horarios deben cubrir la franja reservable de los Cyber-Pods (08–22).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const TIME_ZONE = "America/Montevideo";

export const SITE = {
  name: "Neon Drip Coffee",
  slogan: "Fueled by Caffeine, Driven by Code.",
  description:
    "Cafetería de especialidad de estética cyberpunk en Montevideo, con pedidos Click & Collect, suscripción de café Bean Deploy y coworking en Cyber-Pods.",
  address: {
    street: "Av. 18 de Julio 1234",
    city: "Montevideo",
    region: "Montevideo",
    country: "UY",
    display: "Montevideo, Uruguay",
  },
  hours: [
    {
      days: "Lunes a viernes",
      time: "07:00 – 23:00",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "23:00",
    },
    {
      days: "Sábados",
      time: "08:00 – 00:00",
      dayOfWeek: ["Saturday"],
      opens: "08:00",
      closes: "23:59",
    },
    {
      days: "Domingos",
      time: "08:00 – 22:00",
      dayOfWeek: ["Sunday"],
      opens: "08:00",
      closes: "22:00",
    },
  ],
  podHours: "08:00 – 22:00",
  email: "hola@neondripcoffee.uy",
  social: [
    { label: "Instagram", handle: "@neondripcoffee", href: "#" },
    { label: "GitHub", handle: "neon-drip-coffee", href: "#" },
  ],
} as const;

export const MAP_QUERY = `${SITE.address.street}, ${SITE.address.display}`;
