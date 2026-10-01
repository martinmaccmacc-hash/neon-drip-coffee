// Tipos del menú compartidos entre Server y Client Components (precios ya como number)

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
