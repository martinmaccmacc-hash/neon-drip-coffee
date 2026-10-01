"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    src: "/images/hero-storefront.jpg",
    alt: "Fachada de Neon Drip Coffee de noche, con cartel de neón rosa y vidrieras con borde cian",
    caption: "La fachada",
    detail: "Neón, vidrieras y la calle mojada de Montevideo",
  },
  {
    src: "/images/hero-salon.png",
    alt: "Salón de Neon Drip Coffee con los Cyber-Pods Alpha-1, Alpha-2, Alpha-3 y War Room Gamma junto a las mesas",
    caption: "Zona Cyber-Pods",
    detail: "Tres pods individuales y la War Room Gamma",
  },
  {
    src: "/images/gallery-bar.png",
    alt: "Barra de café de Neon Drip Coffee, con cartelería neón",
    caption: "La barra",
    detail: "Donde cada extracción es un deploy",
  },
  {
    src: "/images/gallery-toma-pedidos.png",
    alt: "Tomando pedidos en el mostrador de Neon Drip Coffee",
    caption: "Tomamos tu pedido",
    detail: "O pedí online y retiralo en 10 minutos",
  },
];

// Carrusel con scroll-snap nativo: se desliza con el dedo en mobile y con
// flechas o puntos en desktop. Sin autoplay, para no mover contenido solo.
export function GalleryCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, index));
    const slide = track.children[clamped] as HTMLElement | undefined;
    if (!slide) return;
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
      behavior: "smooth",
    });
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDistance = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const distance = Math.abs(el.offsetLeft + el.clientWidth / 2 - center);
      if (distance < minDistance) {
        minDistance = distance;
        closest = i;
      }
    });
    setActive(closest);
  }

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Fotos del local"
      className="relative"
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[7.5%] pb-2 [scrollbar-width:none] md:gap-6 md:px-[12%] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide, i) => (
          <figure
            key={slide.src}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${SLIDES.length}: ${slide.caption}`}
            className={`relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl border transition-all duration-500 md:aspect-[16/9] md:w-[76%] ${
              i === active
                ? "border-neon-cyan/50 opacity-100 shadow-[0_0_60px_-20px_rgba(34,211,238,0.5)]"
                : "border-line opacity-50"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(min-width: 768px) 76vw, 85vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/10 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-8">
              <p className="font-mono text-xs text-neon-cyan">
                {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
              </p>
              <p className="mt-1 font-display text-xl font-bold text-ink md:text-2xl">
                {slide.caption}
              </p>
              <p className="mt-1 text-sm text-dim">{slide.detail}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Flechas (desktop) */}
      <button
        type="button"
        onClick={() => goTo(active - 1)}
        disabled={active === 0}
        aria-label="Foto anterior"
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-line bg-void/70 p-3 text-ink backdrop-blur transition-colors hover:border-neon-cyan hover:text-neon-cyan disabled:pointer-events-none disabled:opacity-30 md:block"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => goTo(active + 1)}
        disabled={active === SLIDES.length - 1}
        aria-label="Foto siguiente"
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-line bg-void/70 p-3 text-ink backdrop-blur transition-colors hover:border-neon-cyan hover:text-neon-cyan disabled:pointer-events-none disabled:opacity-30 md:block"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicadores */}
      <div className="mt-6 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir a la foto ${i + 1}: ${slide.caption}`}
            aria-current={i === active}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-8 bg-neon-cyan" : "w-3 bg-line hover:bg-dim"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
