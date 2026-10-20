import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/menu/product-card";
import type { MenuProduct } from "@/types";

export const metadata: Metadata = {
  title: "Menú",
  description:
    "Café de especialidad y repostería para pedir online y retirar en barra en 10 minutos: espresso, latte, cold brew, brownies, cookies y más.",
  alternates: { canonical: "/menu" },
};

// Revalida cada 5 minutos para reflejar cambios de la base de datos
export const revalidate = 300;

export default async function MenuPage() {
  const rawProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      // Repostería y café preparado (las bolsas de grano van en Bean Deploy)
      OR: [
        { category: "PASTRY" },
        { category: "COFFEE", isSubscribable: false },
      ],
    },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Decimal → number para poder pasarlo a Client Components
  const products: MenuProduct[] = rawProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category,
    roastLevel: p.roastLevel,
    intensity: p.intensity,
    origin: p.origin,
    tastingNotes: p.tastingNotes,
    imageUrl: p.imageUrl,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      sku: v.sku,
      weightGr: v.weightGr,
      grindType: v.grindType,
    })),
  }));

  const drinks = products.filter((p) => p.category === "COFFEE");
  const pastries = products.filter((p) => p.category === "PASTRY");

  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <header className="mx-auto mb-16 max-w-3xl text-center">
        <p className="font-mono text-sm text-neon-cyan">{"// menu.tsx"}</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-ink md:text-5xl">
          El Menú
        </h1>
        <p className="mt-4 text-dim">
          Café de alta disponibilidad, servido sin excepciones.
        </p>
      </header>

      {drinks.length > 0 && (
        <MenuSection
          id="core-brews"
          title="Café de Especialidad"
          subtitle="The Core Brews"
          description="Espresso, latte, cold brew y cappuccino con granos de especialidad."
          image={{
            src: "/images/cyber-latte.jpg",
            alt: "Cyber-Latte con latte art geométrico sobre la barra",
            position: "50% 65%",
          }}
          products={drinks}
        />
      )}

      {pastries.length > 0 && (
        <MenuSection
          id="byte-sized-bites"
          title="Byte-Sized Bites"
          subtitle="Repostería & Snacks"
          description="Horneada todos los días para acompañar tu café."
          image={{
            src: "/images/bites-flatlay.jpg",
            alt: "Glitch Brownie, The Cookie Exception e Infinite Loop Donut sobre pizarra negra",
            position: "50% 50%",
          }}
          products={pastries}
          className="mt-20"
        />
      )}

      {products.length === 0 && (
        <p className="text-center font-mono text-dim">
          No hay productos cargados todavía. Corré `npx prisma db seed`.
        </p>
      )}
    </main>
  );
}

function MenuSection({
  id,
  title,
  subtitle,
  description,
  image,
  products,
  className = "",
}: {
  id?: string;
  title: string;
  subtitle: string;
  description?: string;
  image?: { src: string; alt: string; position: string };
  products: MenuProduct[];
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl scroll-mt-24 ${className}`}>
      {image ? (
        <div className="relative mb-8 h-44 overflow-hidden rounded-2xl border border-line sm:h-56 md:h-64">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            style={{ objectPosition: image.position }}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/60 to-void/10" />
          <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
            <span className="font-mono text-sm text-neon-pink">/{subtitle}</span>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">
              {title}
            </h2>
            {description && (
              <p className="mt-2 max-w-md text-sm text-dim">{description}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-8 flex items-baseline gap-3 border-b border-line pb-4">
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          <span className="font-mono text-sm text-neon-pink">/{subtitle}</span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
