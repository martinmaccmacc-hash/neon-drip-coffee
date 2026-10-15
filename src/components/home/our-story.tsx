import Image from "next/image";

const VALUES = [
  {
    commit: "feat: trazabilidad",
    text: "Cada grano con su origen, su finca y su fecha de tueste. Sabemos de dónde viene lo que servimos.",
  },
  {
    commit: "fix: uptime",
    text: "Abiertos desde temprano hasta tarde, todos los días. Un espacio que no se cae.",
  },
  {
    commit: "chore: comunidad",
    text: "Un lugar para programar, aprender y cruzarte con gente que hace lo mismo que vos.",
  },
];

export function OurStory() {
  return (
    <section
      id="nuestra-historia"
      className="scroll-mt-20 px-6 py-20 md:px-12 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line shadow-[0_0_80px_-20px_rgba(34,211,238,0.35)] lg:aspect-[4/5]">
          {/* Foto 16:9 recortada en caja 4:5 (lg) o 4:3: se pide el ancho que realmente ocupa */}
          <Image
            src="/images/hero-salon.png"
            alt="Salón de Neon Drip Coffee, con la barra de café y la zona de Cyber-Pods"
            fill
            sizes="(min-width: 1152px) 1200px, (min-width: 1024px) 111vw, 133vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/90 to-transparent p-5">
            <p className="font-mono text-xs text-dim">
              <span className="text-neon-cyan">~/neon-drip</span> $ el salón,
              de la barra a los pods
            </p>
          </div>
        </div>

        <div>
          <p className="font-mono text-sm text-neon-pink">{"// git log --reverse"}</p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-ink md:text-4xl">
            Nuestra historia
          </h2>

          <div className="mt-6 space-y-4 leading-relaxed text-dim">
            <p>
              Neon Drip Coffee nació de una idea simple:{" "}
              <span className="text-ink">
                el mejor código se escribe con buen café
              </span>
              . Lo imaginamos entre developers y baristas cansados de elegir
              entre cafeterías lindas sin enchufes y oficinas con café de
              máquina.
            </p>
            <p>
              De ahí salió nuestro concepto de{" "}
              <span className="text-neon-cyan">Café de Alta Disponibilidad</span>
              : granos de especialidad con trazabilidad absoluta, baristas que
              tratan cada extracción como un deploy a producción, y un salón
              pensado para quedarse, con luz de neón, buena música y fibra
              óptica simétrica.
            </p>
            <p>
              Hoy somos punto de encuentro para developers, diseñadores,
              estudiantes y noctámbulos. Algunos pasan por un Stack Overflow
              Espresso antes de la daily; otros se quedan horas en un
              Cyber-Pod terminando ese side project que nunca se termina.
            </p>
          </div>

          <ul className="mt-8 space-y-4">
            {VALUES.map((v) => (
              <li key={v.commit} className="rounded-xl border border-line bg-surface/60 p-4">
                <p className="font-mono text-xs text-neon-cyan">{v.commit}</p>
                <p className="mt-1 text-sm text-dim">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
