import { SITE, SITE_URL } from "@/lib/site-config";

// Resumen del sitio para motores de IA (convención llms.txt)
export const dynamic = "force-static";

export function GET() {
  const hours = SITE.hours.map((h) => `- ${h.days}: ${h.time}`).join("\n");

  const body = `# ${SITE.name}

> ${SITE.description}

Ubicación: ${SITE.address.street}, ${SITE.address.display}. Contacto: ${SITE.email}.

## Horarios
${hours}
- Cyber-Pods: todos los días, ${SITE.podHours}

## Servicios
- [Menú y Click & Collect](${SITE_URL}/menu): café de especialidad y repostería; se paga online y se retira en barra en unos 10 minutos.
- [Bean Deploy](${SITE_URL}/bean-deploy): suscripción de café de especialidad en grano o molido, con envíos semanales, quincenales o mensuales a direcciones de Uruguay. Se cancela desde "Mi cuenta".
- [Cyber-Pods](${SITE_URL}/coworking): coworking por hora. Tres pods individuales (Cyber-Pod Alpha) y una sala grupal para 4 personas (War Room Gamma), con equipos de alto rendimiento, monitor 27" QHD y fibra óptica simétrica. Reservas de 1 a 4 horas.

## Más información
- [Preguntas frecuentes](${SITE_URL}/#faq)
- [Nuestra historia](${SITE_URL}/#nuestra-historia)
- [Cómo llegar](${SITE_URL}/#visitanos)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
