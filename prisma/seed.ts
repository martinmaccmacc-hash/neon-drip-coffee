// ============================================================================
// Neon Drip Coffee — Seed Script
//
// Este script llena la base de datos con datos de prueba: bebidas del menú,
// bolsas de café para Bean Deploy, repostería, Cyber-Pods y planes de
// suscripción. Se corre con: npx prisma db seed
//
// Usamos `upsert` (en vez de `create`) en cada producto: upsert busca primero
// si ya existe una fila con ese valor único (el slug, en el caso de Product),
// y si existe NO la duplica — solo la deja como está. Esto hace que puedas
// correr este script mil veces sin llenar la base de datos de copias.
// ============================================================================

import {
  PrismaClient,
  ProductCategory,
  RoastLevel,
  GrindType,
  PodType,
  SubscriptionFrequency,
} from "@prisma/client";

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// Tipos auxiliares — solo para que TypeScript nos avise si nos olvidamos
// un campo obligatorio al escribir los datos de abajo.
// ----------------------------------------------------------------------------

type VariantSeed = {
  name: string;
  grindType?: GrindType;
  weightGr?: number;
  price: number;
  sku: string;
  stock?: number;
};

type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  roastLevel?: RoastLevel;
  intensity?: number;
  origin?: string;
  tastingNotes?: string;
  basePrice: number;
  isSubscribable?: boolean;
  variants: VariantSeed[];
};

// ----------------------------------------------------------------------------
// 1. CORE BREWS — bebidas preparadas, se piden en el mostrador (Click & Collect)
// ----------------------------------------------------------------------------

const coreBrews: ProductSeed[] = [
  {
    slug: "stack-overflow-espresso",
    name: "Stack Overflow Espresso",
    description:
      "Espresso doble, puro y directo. Sin errores, sin humo, sin excusas.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.DARK,
    intensity: 5,
    basePrice: 3.2,
    variants: [{ name: "Individual (2oz)", price: 3.2, sku: "DRK-001-A" }],
  },
  {
    slug: "cyber-latte",
    name: "Cyber-Latte",
    description:
      "Latte tradicional con un toque de jarabe de lavanda casero y latte art geométrico.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.MEDIUM,
    intensity: 3,
    basePrice: 4.5,
    variants: [
      { name: "8oz", price: 4.5, sku: "DRK-002-A" },
      { name: "12oz", price: 5.2, sku: "DRK-002-B" },
      { name: "16oz", price: 5.9, sku: "DRK-002-C" },
    ],
  },
  {
    slug: "cold-brew-null-pointer",
    name: 'Cold Brew "Null Pointer"',
    description:
      "Extraído en frío durante 18 horas. Suave, refrescante, con notas a chocolate amargo.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.MEDIUM,
    intensity: 3,
    basePrice: 4.8,
    variants: [
      { name: "12oz", price: 4.8, sku: "DRK-003-A" },
      { name: "16oz", price: 5.5, sku: "DRK-003-B" },
    ],
  },
  {
    slug: "the-monolith-cappuccino",
    name: "The Monolith (Cappuccino)",
    description:
      "Capuchino perfectamente balanceado, con espuma texturizada y polvo de cacao.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.DARK,
    intensity: 4,
    basePrice: 4.2,
    variants: [
      { name: "8oz", price: 4.2, sku: "DRK-004-A" },
      { name: "12oz", price: 4.9, sku: "DRK-004-B" },
    ],
  },
  {
    slug: "404-mocha-not-found",
    name: "404 Mocha Not Found",
    description:
      "Espresso, chocolate belga derretido y leche vaporizada. Encontrado, y delicioso.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.MEDIUM,
    intensity: 3,
    basePrice: 4.8,
    variants: [
      { name: "8oz", price: 4.8, sku: "DRK-005-A" },
      { name: "12oz", price: 5.5, sku: "DRK-005-B" },
    ],
  },
  {
    slug: "async-affogato",
    name: "Async Affogato",
    description:
      "Un shot de espresso caliente cae sobre helado de vainilla artesanal. Ejecución no bloqueante.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.DARK,
    intensity: 4,
    basePrice: 5.5,
    variants: [{ name: "Individual", price: 5.5, sku: "DRK-006-A" }],
  },
  {
    slug: "kernel-panic-cortado",
    name: "Kernel Panic Cortado",
    description:
      "Espresso cortado con leche vaporizada en partes iguales. Intenso, corto, sin errores de segmentación.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.DARK,
    intensity: 4,
    basePrice: 4.0,
    variants: [{ name: "Individual (4oz)", price: 4.0, sku: "DRK-007-A" }],
  },
  {
    slug: "git-blame-frappe",
    name: "Git Blame Frappé",
    description:
      "Café frío batido con hielo. Vas a querer culpar a alguien por lo rico que está.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.LIGHT,
    intensity: 2,
    basePrice: 5.2,
    variants: [
      { name: "12oz", price: 5.2, sku: "DRK-008-A" },
      { name: "16oz", price: 5.9, sku: "DRK-008-B" },
    ],
  },
];

// ----------------------------------------------------------------------------
// 2. BEAN DEPLOY — bolsas de café en grano/molido, para suscripción y retail
// ----------------------------------------------------------------------------

const beanBags: ProductSeed[] = [
  {
    slug: "neon-ethiopia",
    name: "Neon Ethiopia",
    description:
      "Un despliegue floral con acidez brillante: el sabor que enciende tu editor de código.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.LIGHT,
    intensity: 2,
    origin: "Yirgacheffe, Etiopía",
    tastingNotes: "Floral, cítricos, té negro",
    basePrice: 14.0,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 14.0, sku: "BAG-001-A" },
      { name: "250g - Molido (Filtro)", grindType: GrindType.FILTER, weightGr: 250, price: 14.0, sku: "BAG-001-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 25.0, sku: "BAG-001-C" },
    ],
  },
  {
    slug: "quantum-colombia",
    name: "Quantum Colombia",
    description:
      "Balance perfecto entre dulzura y cuerpo: el estado por defecto de un buen café.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.MEDIUM,
    intensity: 3,
    origin: "Huila, Colombia",
    tastingNotes: "Chocolate, caramelo, nuez",
    basePrice: 13.0,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 13.0, sku: "BAG-002-A" },
      { name: "250g - Molido (Espresso)", grindType: GrindType.ESPRESSO, weightGr: 250, price: 13.0, sku: "BAG-002-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 23.0, sku: "BAG-002-C" },
    ],
  },
  {
    slug: "cyber-sumatra",
    name: "Cyber Sumatra",
    description:
      "Cuerpo denso y terroso, para cuando el deploy de producción no puede esperar.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.DARK,
    intensity: 5,
    origin: "Sumatra, Indonesia",
    tastingNotes: "Tierra húmeda, especias, cuerpo intenso",
    basePrice: 13.5,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 13.5, sku: "BAG-003-A" },
      { name: "250g - Molido (Espresso)", grindType: GrindType.ESPRESSO, weightGr: 250, price: 13.5, sku: "BAG-003-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 24.0, sku: "BAG-003-C" },
    ],
  },
  {
    slug: "binary-brazil",
    name: "Binary Brazil",
    description: "Simple, confiable, sin sorpresas: el café que nunca rompe el build.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.MEDIUM,
    intensity: 3,
    origin: "Cerrado, Brasil",
    tastingNotes: "Chocolate con leche, avellanas",
    basePrice: 12.0,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 12.0, sku: "BAG-004-A" },
      { name: "250g - Molido (Filtro)", grindType: GrindType.FILTER, weightGr: 250, price: 12.0, sku: "BAG-004-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 21.0, sku: "BAG-004-C" },
    ],
  },
  {
    slug: "overclocked-kenya",
    name: "Overclocked Kenya",
    description: "Acidez vibrante que te va a acelerar el clock speed de la mañana.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.LIGHT,
    intensity: 2,
    origin: "Nyeri, Kenia",
    tastingNotes: "Frutos rojos, vino, acidez brillante",
    basePrice: 15.5,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 15.5, sku: "BAG-005-A" },
      { name: "250g - Molido (Filtro)", grindType: GrindType.FILTER, weightGr: 250, price: 15.5, sku: "BAG-005-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 28.0, sku: "BAG-005-C" },
    ],
  },
  {
    slug: "legacy-guatemala",
    name: "Legacy Guatemala",
    description:
      "Un clásico que se sigue manteniendo, como ese código viejo que todavía nadie se anima a tocar.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.DARK,
    intensity: 4,
    origin: "Antigua, Guatemala",
    tastingNotes: "Cacao, especias, final ahumado",
    basePrice: 13.8,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 13.8, sku: "BAG-006-A" },
      { name: "250g - Molido (Espresso)", grindType: GrindType.ESPRESSO, weightGr: 250, price: 13.8, sku: "BAG-006-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 24.5, sku: "BAG-006-C" },
    ],
  },
];

// ----------------------------------------------------------------------------
// 3. BYTE-SIZED BITES — repostería y snacks
// ----------------------------------------------------------------------------

const pastries: ProductSeed[] = [
  {
    slug: "glitch-brownie",
    name: "Glitch Brownie",
    description:
      "Brownie de chocolate belga con hilos de chocolate rosa y polvo de oro comestible.",
    category: ProductCategory.PASTRY,
    basePrice: 4.5,
    variants: [{ name: "Individual", price: 4.5, sku: "PST-001-A" }],
  },
  {
    slug: "the-cookie-exception",
    name: "The Cookie Exception",
    description: "Galleta gigante de chispas de tres tipos de chocolate, servida tibia.",
    category: ProductCategory.PASTRY,
    basePrice: 3.8,
    variants: [{ name: "Individual", price: 3.8, sku: "PST-002-A" }],
  },
  {
    slug: "opensource-toast",
    name: "OpenSource Toast",
    description:
      "Tostada de masa madre con aguacate machacado, huevo ponchado, sésamo negro y un toque de chile.",
    category: ProductCategory.PASTRY,
    basePrice: 6.5,
    variants: [{ name: "Individual", price: 6.5, sku: "PST-003-A" }],
  },
  {
    slug: "stack-trace-scone",
    name: "Stack Trace Scone",
    description: "Scone de manteca con arándanos: cada capa cuenta una parte del error.",
    category: ProductCategory.PASTRY,
    basePrice: 3.9,
    variants: [{ name: "Individual", price: 3.9, sku: "PST-004-A" }],
  },
  {
    slug: "merge-conflict-muffin",
    name: "Merge Conflict Muffin",
    description: "Muffin de chocolate y arándanos que decidieron no resolver sus diferencias.",
    category: ProductCategory.PASTRY,
    basePrice: 4.0,
    variants: [{ name: "Individual", price: 4.0, sku: "PST-005-A" }],
  },
  {
    slug: "404-croissant-not-found",
    name: "404 Croissant Not Found",
    description: "Croissant de manteca clásico. Simplemente no lo vas a encontrar en ningún otro lado.",
    category: ProductCategory.PASTRY,
    basePrice: 3.5,
    variants: [{ name: "Individual", price: 3.5, sku: "PST-006-A" }],
  },
  {
    slug: "infinite-loop-donut",
    name: "Infinite Loop Donut",
    description: "Dona glaseada con chispas de colores neón. Una vez que empezás, no parás.",
    category: ProductCategory.PASTRY,
    basePrice: 3.6,
    variants: [{ name: "Individual", price: 3.6, sku: "PST-007-A" }],
  },
  {
    slug: "buffer-overflow-bagel",
    name: "Buffer Overflow Bagel",
    description: "Bagel con queso crema, tanto que se desborda por los costados.",
    category: ProductCategory.PASTRY,
    basePrice: 4.8,
    variants: [{ name: "Individual", price: 4.8, sku: "PST-008-A" }],
  },
];

// ----------------------------------------------------------------------------
// Función reutilizable: crea (o actualiza) un producto y todas sus variantes
// ----------------------------------------------------------------------------

async function seedProducts(products: ProductSeed[]) {
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.category,
        roastLevel: p.roastLevel,
        intensity: p.intensity,
        origin: p.origin,
        tastingNotes: p.tastingNotes,
        basePrice: p.basePrice,
        isSubscribable: p.isSubscribable ?? false,
      },
    });

    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          productId: product.id,
          name: v.name,
          grindType: v.grindType ?? GrindType.NOT_APPLICABLE,
          weightGr: v.weightGr,
          price: v.price,
          sku: v.sku,
          stock: v.stock ?? 50,
        },
      });
    }

    console.log(`  ✓ ${p.name} (${p.variants.length} variante${p.variants.length > 1 ? "s" : ""})`);
  }
}

// ----------------------------------------------------------------------------
// 4. CYBER-PODS — espacios de coworking
// ----------------------------------------------------------------------------

async function seedCyberPods() {
  const existing = await prisma.cyberPod.count();
  if (existing > 0) {
    console.log("  (ya existen Cyber-Pods, se omite)");
    return;
  }

  const pods = [
    {
      name: "Cyber-Pod Alpha",
      type: PodType.INDIVIDUAL,
      capacity: 1,
      hourlyRate: 8.0,
      amenities: ["Fibra simétrica 1Gbps", 'Monitor 27" 4K', "Silla ergonómica"],
    },
    {
      name: "Cyber-Pod Beta",
      type: PodType.INDIVIDUAL,
      capacity: 1,
      hourlyRate: 8.0,
      amenities: ["Fibra simétrica 1Gbps", 'Monitor 27" 4K', "Standing desk"],
    },
    {
      name: "War Room Gamma",
      type: PodType.GROUP,
      capacity: 4,
      hourlyRate: 22.0,
      amenities: [
        "Fibra simétrica 1Gbps",
        'TV 55" para pantalla compartida',
        "Pizarra digital",
        "4 sillas ergonómicas",
      ],
    },
  ];

  for (const pod of pods) {
    await prisma.cyberPod.create({ data: pod });
    console.log(`  ✓ ${pod.name}`);
  }
}

// ----------------------------------------------------------------------------
// 5. PLANES DE SUSCRIPCIÓN — Bean Deploy
// ----------------------------------------------------------------------------

async function seedSubscriptionPlans() {
  const existing = await prisma.subscriptionPlan.count();
  if (existing > 0) {
    console.log("  (ya existen planes, se omite)");
    return;
  }

  const plans = [
    {
      name: "Explorer",
      description: "Perfecto para probar sabores nuevos cada mes.",
      frequency: SubscriptionFrequency.MONTHLY,
      weightGr: 250,
      price: 16.9,
    },
    {
      name: "Power User",
      description: "Para quienes no pueden vivir sin su dosis quincenal.",
      frequency: SubscriptionFrequency.BIWEEKLY,
      weightGr: 250,
      price: 15.9,
    },
    {
      name: "Full Stack",
      description: "El plan definitivo: más café, más seguido, mejor precio por gramo.",
      frequency: SubscriptionFrequency.WEEKLY,
      weightGr: 500,
      price: 28.9,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.create({ data: plan });
    console.log(`  ✓ ${plan.name}`);
  }
}

// ----------------------------------------------------------------------------
// MAIN — orquesta todo el proceso, en orden
// ----------------------------------------------------------------------------

async function main() {
  console.log("🌱 Sembrando Neon Drip Coffee...\n");

  console.log("☕ Core Brews...");
  await seedProducts(coreBrews);

  console.log("\n🎒 Bean Deploy (bolsas de café)...");
  await seedProducts(beanBags);

  console.log("\n🍪 Byte-Sized Bites...");
  await seedProducts(pastries);

  console.log("\n🛠️  Cyber-Pods...");
  await seedCyberPods();

  console.log("\n📦 Planes de suscripción...");
  await seedSubscriptionPlans();

  console.log("\n✅ Listo! Base de datos sembrada con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error sembrando la base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });