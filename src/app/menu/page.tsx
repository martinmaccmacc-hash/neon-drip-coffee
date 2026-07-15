import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/menu/product-card";
import type { MenuProduct } from "@/types";

// Esta función corre en el SERVIDOR, nunca en el navegador del usuario.
// Por eso podemos usar Prisma acá directo, sin pasar por una API Route.
export default async function MenuPage() {
  const rawProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      // Mostramos: toda la repostería, y solo el café que NO es para
      // Bean Deploy (las bolsas de grano van a tener su propia página
      // más adelante, en /bean-deploy).
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

  // Convertimos los Decimal de Prisma a number plano, porque ProductCard
  // es un Client Component y no puede recibir objetos Decimal como prop.
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
        <p className="font-mono text-sm text-neon-cyan">// menu.tsx</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-ink md:text-5xl">
          El Menú
        </h1>
        <p className="mt-4 text-dim">
          Café de alta disponibilidad, servido sin excepciones.
        </p>
      </header>

      {drinks.length > 0 && (
        <MenuSection
          title="Café de Especialidad"
          subtitle="The Core Brews"
          products={drinks}
        />
      )}

      {pastries.length > 0 && (
        <MenuSection
          title="Byte-Sized Bites"
          subtitle="Repostería & Snacks"
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

// Este helper no necesita ser un Client Component — solo organiza el
// layout, no maneja ningún estado ni interactividad por sí mismo.
function MenuSection({
  title,
  subtitle,
  products,
  className = "",
}: {
  title: string;
  subtitle: string;
  products: MenuProduct[];
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-6xl ${className}`}>
      <div className="mb-8 flex items-baseline gap-3 border-b border-line pb-4">
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
        <span className="font-mono text-sm text-neon-pink">/{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
