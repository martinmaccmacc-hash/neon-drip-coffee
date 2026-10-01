import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Coffee, Moon, Timer, Wifi } from "lucide-react";
import { OurStory } from "@/components/home/our-story";
import { Faq } from "@/components/home/faq";
import { VisitUs } from "@/components/home/visit-us";
import { GalleryCarousel } from "@/components/home/gallery-carousel";
import { SITE, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Datos estructurados del negocio (schema.org CafeOrCoffeeShop)
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: SITE.name,
  slogan: SITE.slogan,
  description: SITE.description,
  url: SITE_URL,
  image: `${SITE_URL}/images/hero-storefront.jpg`,
  email: SITE.email,
  priceRange: "$$",
  servesCuisine: ["Café de especialidad", "Repostería"],
  hasMenu: `${SITE_URL}/menu`,
  acceptsReservations: true,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    addressCountry: SITE.address.country,
  },
  openingHoursSpecification: SITE.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.dayOfWeek,
    opens: h.opens,
    closes: h.closes,
  })),
  amenityFeature: [
    "Coworking con Cyber-Pods",
    "Fibra óptica simétrica",
    "Pedidos Click & Collect",
  ].map((name) => ({
    "@type": "LocationFeatureSpecification",
    name,
    value: true,
  })),
};

export default function Home() {
  return (
    <main className="min-h-screen bg-void">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />

      {/* Hero */}
      <section className="relative -mt-16 flex min-h-[90vh] items-center justify-center overflow-hidden border-b border-line pt-16">
        <Image
          src="/images/hero-storefront.jpg"
          alt="Fachada de Neon Drip Coffee de noche, con cartel de neón rosa y la vidriera con borde neón cian, mostrando la zona de Cyber-Pods"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-transparent to-void" />

        <div className="relative z-10 mx-4 w-fit max-w-[calc(100%-2rem)] rounded-3xl border border-white/10 bg-void/55 px-5 py-7 text-center backdrop-blur-md sm:px-8 sm:py-9">
          <p className="font-mono text-sm text-neon-cyan">
            {"// neon-drip-coffee.exe"}
          </p>
          <h1 className="mt-4 font-display text-xl font-bold uppercase tracking-wide text-ink sm:text-4xl lg:text-6xl xl:text-7xl">
            Neon<span className="text-neon-cyan">Drip</span>Coffee
          </h1>
          <p className="mt-4 font-mono text-sm text-dim sm:text-base md:text-lg">
            Fueled by Caffeine, Driven by Code.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/menu"
              className="rounded-lg bg-neon-purple px-8 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
            >
              Ver el menú
            </Link>
            <Link
              href="/coworking"
              className="rounded-lg border border-line px-8 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:border-neon-cyan hover:text-neon-cyan"
            >
              Reservar un pod
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b border-line bg-surface/40">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-line md:grid-cols-4">
          {HIGHLIGHTS.map(({ icon: Icon, title, detail }) => (
            <li
              key={title}
              className="flex flex-col items-center gap-2 bg-void px-4 py-8 text-center"
            >
              <Icon className="h-5 w-5 text-neon-cyan" />
              <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
                {title}
              </p>
              <p className="font-mono text-xs text-dim">{detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Servicios */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto mb-16 max-w-2xl text-center md:mb-24">
          <p className="font-mono text-sm text-neon-pink">{"// tres-servicios"}</p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-ink md:text-4xl">
            Un café. Tres formas de vivirlo.
          </h2>
          <p className="mt-4 text-dim">
            Pedí para llevar, recibí grano de especialidad en tu casa o quedate
            a programar en un Cyber-Pod.
          </p>
        </div>

        <div className="space-y-20 md:space-y-32">
          <FeatureRow
            number="01"
            eyebrow="Click & Collect"
            title="Pedí online. Retirá en barra."
            description="Armá tu pedido desde la web y pasá a buscarlo en 10 minutos. Sin filas, sin esperas: tu Cyber-Latte te está esperando."
            bullets={[
              "Retiro en barra en 10 minutos",
              "Pago online seguro",
              "Café de especialidad y repostería del día",
            ]}
            cta={{ href: "/menu", label: "Ver el menú" }}
            image={{
              src: "/images/cyber-latte.jpg",
              alt: "Cyber-Latte con latte art geométrico sobre la barra, con carteles de neón de fondo",
              position: "50% 70%",
            }}
            accent="cyan"
          />
          <FeatureRow
            number="02"
            eyebrow="Bean Deploy"
            title="Café de especialidad, directo a tu puerta."
            description="Una bolsa de grano seleccionado por nuestro barista, en grano o molido, entregada en la frecuencia que elijas."
            bullets={[
              "Selección del barista con trazabilidad de origen",
              "Envíos semanales, quincenales o mensuales",
              "En grano o molido, como prefieras",
            ]}
            cta={{ href: "/bean-deploy", label: "Ver planes" }}
            image={{
              src: "/images/bean-deploy-bag.jpg",
              alt: "Bolsa de café Neon Ethiopia de Neon Drip Coffee rodeada de granos tostados",
              position: "50% 50%",
            }}
            accent="purple"
            reverse
          />
          <FeatureRow
            number="03"
            eyebrow="Cyber-Pods"
            title="Tu espacio para hacer deploy."
            description={'Pods individuales y una sala grupal, con equipos de alto rendimiento, monitor 27" QHD y fibra óptica simétrica.'}
            bullets={[
              "3 pods individuales + War Room Gamma (4 personas)",
              "Fibra óptica simétrica y USB-C con video",
              "Descuento en reservas de 3 horas o más",
            ]}
            cta={{ href: "/coworking", label: "Reservar un pod" }}
            image={{
              src: "/images/cyber-pod-alpha.jpg",
              alt: "Interior del Cyber-Pod Alpha-3: escritorio de madera con monitor, laptop, teclado y silla ergonómica bajo luz neón cian",
              position: "50% 50%",
            }}
            accent="pink"
          />
        </div>
      </section>

      {/* Byte-Sized Bites */}
      <section className="border-y border-line bg-surface/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:px-12 md:py-28">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-line shadow-[0_0_80px_-20px_rgba(236,72,153,0.45)]">
            <Image
              src="/images/bites-flatlay.jpg"
              alt="Glitch Brownie con hilos de chocolate rosa, The Cookie Exception e Infinite Loop Donut sobre pizarra negra"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="font-mono text-sm text-neon-pink">{"// byte-sized-bites"}</p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-ink md:text-4xl">
              Repostería para acompañar el código.
            </h2>
            <p className="mt-4 text-dim">
              Horneada todos los días, pensada para durar lo que dura un buen
              sprint.
            </p>

            <dl className="mt-8 space-y-5">
              {BITES.map((bite) => (
                <div key={bite.name} className="border-l-2 border-neon-pink/60 pl-4">
                  <dt className="font-display text-lg font-semibold text-ink">
                    {bite.name}
                  </dt>
                  <dd className="mt-1 text-sm text-dim">{bite.description}</dd>
                </div>
              ))}
            </dl>

            <Link
              href="/menu#byte-sized-bites"
              className="mt-10 inline-flex items-center gap-2 rounded-lg border border-line px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:border-neon-pink hover:text-neon-pink"
            >
              Ver repostería <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Nuestra historia */}
      <OurStory />

      {/* Galería */}
      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="font-mono text-sm text-neon-pink">
              {"// adentro-del-local"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-ink md:text-4xl">
              Conocé el espacio
            </h2>
          </div>

          <GalleryCarousel />
        </div>
      </section>

      {/* FAQ y ubicación */}
      <Faq />
      <VisitUs />

      {/* CTA final */}
      <section className="px-6 pb-24 md:px-12">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 text-center md:px-16">
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-neon-purple/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-neon-cyan/20 blur-3xl" />

          <p className="relative font-mono text-sm text-neon-cyan">
            $ git commit -m &quot;café&quot;
          </p>
          <h2 className="relative mt-3 font-display text-2xl font-bold uppercase tracking-wide text-ink md:text-4xl">
            ¿Listo para tu próximo deploy?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-dim">
            Pedí tu café, suscribite a Bean Deploy o reservá un Cyber-Pod. Todo
            desde acá, en menos de un minuto.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/menu"
              className="rounded-lg bg-neon-purple px-8 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
            >
              Pedir ahora
            </Link>
            <Link
              href="/coworking"
              className="rounded-lg border border-line px-8 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:border-neon-cyan hover:text-neon-cyan"
            >
              Reservar un pod
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// Datos de las secciones
const HIGHLIGHTS = [
  { icon: Timer, title: "10 minutos", detail: "retiro en barra" },
  { icon: Wifi, title: "Fibra simétrica", detail: "en todos los pods" },
  { icon: Coffee, title: "Especialidad", detail: "granos con trazabilidad" },
  { icon: Moon, title: "Hasta tarde", detail: "para noctámbulos" },
];

const BITES = [
  {
    name: "Glitch Brownie",
    description:
      "Chocolate belga con hilos de chocolate rosa y polvo de oro comestible.",
  },
  {
    name: "The Cookie Exception",
    description:
      "Galleta gigante con tres tipos de chocolate, servida tibia.",
  },
  {
    name: "Infinite Loop Donut",
    description:
      "Glaseado rosa y chispas de colores neón. Una vez que empezás, no parás.",
  },
];

const ACCENTS = {
  cyan: {
    text: "text-neon-cyan",
    glow: "shadow-[0_0_80px_-20px_rgba(34,211,238,0.45)]",
    hover: "hover:border-neon-cyan hover:text-neon-cyan",
  },
  purple: {
    text: "text-neon-purple",
    glow: "shadow-[0_0_80px_-20px_rgba(168,85,247,0.5)]",
    hover: "hover:border-neon-purple hover:text-neon-purple",
  },
  pink: {
    text: "text-neon-pink",
    glow: "shadow-[0_0_80px_-20px_rgba(236,72,153,0.45)]",
    hover: "hover:border-neon-pink hover:text-neon-pink",
  },
} as const;

// Fila de servicio: imagen + texto, alterna lados en desktop
function FeatureRow({
  number,
  eyebrow,
  title,
  description,
  bullets,
  cta,
  image,
  accent,
  reverse = false,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  cta: { href: string; label: string };
  image: { src: string; alt: string; position: string };
  accent: keyof typeof ACCENTS;
  reverse?: boolean;
}) {
  const a = ACCENTS[accent];

  return (
    <article className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
      <div
        className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border border-line md:aspect-[4/5] ${a.glow} ${
          reverse ? "md:order-2" : ""
        }`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          style={{ objectPosition: image.position }}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className={reverse ? "md:order-1" : ""}>
        <div className="flex items-baseline gap-3">
          <span className={`font-display text-4xl font-bold ${a.text} opacity-80`}>
            {number}
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-dim">
            {eyebrow}
          </span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-ink md:text-3xl">
          {title}
        </h3>
        <p className="mt-4 leading-relaxed text-dim">{description}</p>

        <ul className="mt-6 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2 font-mono text-sm text-dim">
              <span className={a.text}>›</span>
              {b}
            </li>
          ))}
        </ul>

        <Link
          href={cta.href}
          className={`mt-8 inline-flex items-center gap-2 rounded-lg border border-line px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-colors ${a.hover}`}
        >
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
