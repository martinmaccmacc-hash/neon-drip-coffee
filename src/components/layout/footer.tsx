import Link from "next/link";
import { Clock, Mail, MapPin } from "lucide-react";
import { SITE } from "@/lib/site-config";

const FOOTER_LINKS = [
  { href: "/menu", label: "Menú · Click & Collect" },
  { href: "/bean-deploy", label: "Bean Deploy" },
  { href: "/coworking", label: "Cyber-Pods" },
  { href: "/#nuestra-historia", label: "Nuestra historia" },
  { href: "/#faq", label: "Preguntas frecuentes" },
  { href: "/#visitanos", label: "Cómo llegar" },
  { href: "/account", label: "Mi cuenta" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-void">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent" />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4 md:px-12">
        {/* Marca */}
        <div className="md:col-span-1">
          <Link
            href="/"
            className="font-display text-lg font-bold uppercase tracking-wide text-ink"
          >
            Neon<span className="text-neon-cyan">Drip</span>Coffee
          </Link>
          <p className="mt-3 font-mono text-xs text-dim">{SITE.slogan}</p>
          <p className="mt-4 text-sm leading-relaxed text-dim">
            Café de especialidad y coworking para developers, diseñadores y
            noctámbulos.
          </p>
        </div>

        {/* Navegación */}
        <FooterColumn title="// explorar">
          <nav aria-label="Enlaces del sitio">
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-dim transition-colors hover:text-neon-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </FooterColumn>

        {/* Horarios */}
        <FooterColumn title="// horarios">
          <ul className="space-y-2">
            {SITE.hours.map((h) => (
              <li key={h.days} className="flex items-start gap-2 text-sm">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neon-pink" />
                <span>
                  <span className="block text-ink">{h.days}</span>
                  <span className="font-mono text-xs text-dim">{h.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </FooterColumn>

        {/* Contacto */}
        <FooterColumn title="// contacto">
          <address className="not-italic">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neon-pink" />
                <span className="text-dim">
                  {SITE.address.street}
                  <br />
                  {SITE.address.display}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-neon-pink" />
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-dim transition-colors hover:text-neon-cyan"
                >
                  {SITE.email}
                </a>
              </li>
              {SITE.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="font-mono text-xs text-dim transition-colors hover:text-neon-cyan"
                  >
                    <span className="text-neon-cyan">{s.label}</span> · {s.handle}
                  </a>
                </li>
              ))}
            </ul>
          </address>
        </FooterColumn>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 font-mono text-xs text-dim sm:flex-row sm:items-center sm:justify-between md:px-12">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Proyecto de portfolio.
          </p>
          <p>
            <span className="text-neon-cyan">$</span> built with Next.js ·
            Prisma · Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-4 font-mono text-xs uppercase tracking-wide text-neon-cyan">
        {title}
      </p>
      {children}
    </div>
  );
}
