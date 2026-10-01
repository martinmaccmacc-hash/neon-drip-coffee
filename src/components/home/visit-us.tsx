import { Clock, MapPin, Navigation } from "lucide-react";
import { MAP_QUERY, SITE } from "@/lib/site-config";

// Google Maps embebido (sin API key) con filtro para el tema oscuro
export function VisitUs() {
  const query = encodeURIComponent(MAP_QUERY);

  return (
    <section
      id="visitanos"
      className="scroll-mt-20 px-6 py-20 md:px-12 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="font-mono text-sm text-neon-pink">{"// location.json"}</p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-ink md:text-4xl">
            Visitanos
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 lg:col-span-1">
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-neon-cyan">
                <MapPin className="h-4 w-4" /> Dirección
              </p>
              <p className="mt-2 text-ink">{SITE.address.street}</p>
              <p className="text-sm text-dim">{SITE.address.display}</p>
            </div>

            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-neon-cyan">
                <Clock className="h-4 w-4" /> Horarios
              </p>
              <ul className="mt-2 space-y-1.5">
                {SITE.hours.map((h) => (
                  <li key={h.days} className="flex justify-between gap-4 text-sm">
                    <span className="text-dim">{h.days}</span>
                    <span className="font-mono text-ink">{h.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-mono text-xs text-dim">
                Cyber-Pods: todos los días, {SITE.podHours}
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-neon-purple px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
            >
              <Navigation className="h-4 w-4" /> Cómo llegar
            </a>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-line lg:col-span-2">
            <iframe
              title={`Mapa: ${MAP_QUERY}`}
              src={`https://www.google.com/maps?q=${query}&z=16&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 [filter:invert(90%)_hue-rotate(180deg)_saturate(0.8)_brightness(0.95)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
