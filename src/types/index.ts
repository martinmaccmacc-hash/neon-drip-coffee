// Tipos compartidos entre el Server Component (page.tsx, que consulta la
// base de datos) y los Client Components (product-card.tsx, variant-selector.tsx,
// que muestran los datos e interactúan con el usuario).
//
// Nota que `price` es `number`, no `Decimal` como en Prisma — ya viene
// convertido, porque un Client Component no puede recibir un objeto Decimal.

export type MenuVariant = {
  id: string;
  name: string;
  price: number;
  sku: string;
  weightGr: number | null;
  grindType: string;
};

export type MenuProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "COFFEE" | "PASTRY";
  roastLevel: string | null;
  intensity: number | null;
  origin: string | null;
  tastingNotes: string | null;
  variants: MenuVariant[];
};
