import { Plus } from "lucide-react";
import { SITE } from "@/lib/site-config";

// Mantener alineado con las reglas reales (horarios, cancelaciones, envíos)
const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Cómo funciona Click & Collect?",
    a: "Elegís tus productos en el menú, pagás online y pasás a retirarlos por la barra. Tu pedido está listo en unos 10 minutos, así que no hacés fila ni esperás.",
  },
  {
    q: "¿Qué medios de pago aceptan en la web?",
    a: "Tarjetas de crédito y débito, a través de Stripe. El pago se procesa en la plataforma segura de Stripe: los datos de tu tarjeta nunca pasan por nuestros servidores.",
  },
  {
    q: "¿Necesito una cuenta?",
    a: "Para mirar el menú, no. Para reservar un Cyber-Pod o suscribirte a Bean Deploy, sí: así podés ver tus reservas, pedidos y suscripciones desde \"Mi cuenta\".",
  },
  {
    q: "¿Cuándo puedo reservar un Cyber-Pod y cuánto cuesta?",
    a: `Todos los días de ${SITE.podHours}, en bloques de 1 a 4 horas. Los Cyber-Pod Alpha (individuales) cuestan $250 la hora, y si reservás 3 horas o más la hora baja a $200. War Room Gamma (hasta 4 personas) cuesta $800 la hora.`,
  },
  {
    q: "¿Qué incluye un Cyber-Pod?",
    a: "Un equipo de alto rendimiento (Intel Core i7 / AMD Ryzen 7, SSD NVMe), monitor 27\" QHD, cable USB-C con video y carga, teclado y ratón ergonómicos, silla ergonómica profesional y fibra óptica simétrica. Si preferís, conectá tu propia laptop. War Room Gamma suma 4 puestos y una pizarra digital.",
  },
  {
    q: "¿Puedo cancelar o cambiar una reserva?",
    a: `Sí: entrás a "Mi cuenta" → "Reservas" y la cancelás hasta 2 horas antes del inicio. Te devolvemos el total a la misma tarjeta (puede demorar unos días en verse según tu banco). Para cambiar el horario, cancelá y reservá de nuevo.`,
  },
  {
    q: "¿Cómo funciona Bean Deploy?",
    a: "Elegís un plan y la frecuencia de envío (semanal, quincenal o mensual) y cargás tu dirección. En cada envío, nuestro barista selecciona un café de especialidad con trazabilidad de origen, y lo recibís en grano o molido.",
  },
  {
    q: "¿A dónde envían Bean Deploy?",
    a: "A direcciones dentro de Uruguay. Al suscribirte, el buscador de direcciones te sugiere la tuya para que no haya errores en la entrega.",
  },
  {
    q: "¿Puedo cancelar mi suscripción?",
    a: "Sí, cuando quieras y sin llamar a nadie: entrás a \"Mi cuenta\" → \"Suscripciones\" y la cancelás desde ahí.",
  },
  {
    q: "¿Puedo ir a trabajar sin reservar un pod?",
    a: "Claro: el salón está abierto para todos. Reservar un Cyber-Pod te asegura un lugar tranquilo con equipo completo durante el horario que elegiste.",
  },
];

// Acordeón nativo con <details>: accesible y sin JavaScript
export function Faq() {
  // Datos estructurados FAQPage (schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-line bg-surface/40 px-6 py-20 md:px-12 md:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="font-mono text-sm text-neon-pink">{"// faq.md"}</p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-ink md:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-dim">
            ¿No encontrás lo que buscás? Escribinos a{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-neon-cyan underline underline-offset-4 hover:text-ink"
            >
              {SITE.email}
            </a>
            .
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-line bg-void transition-colors open:border-neon-cyan/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-display text-sm font-semibold text-ink sm:text-base">
                  {f.q}
                </span>
                <Plus className="h-5 w-5 shrink-0 text-neon-cyan transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-dim">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
