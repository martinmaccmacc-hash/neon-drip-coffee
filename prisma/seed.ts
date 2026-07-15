// ============================================================================
// Neon Drip Coffee — Seed Script
//
// Este script llena la base de datos con datos de prueba: bebidas del menú,
// bolsas de café para Bean Deploy, repostería, Cyber-Pods y planes de
// suscripción. Se corre con: npx prisma db seed
//
// Usamos `upsert` en cada producto: busca primero si ya existe una fila con
// ese valor único (el slug, en el caso de Product), y si existe, la
// ACTUALIZA con los datos actuales de este archivo (antes esto no pasaba,
// era un bug: el `update` estaba vacío y por eso los precios viejos no se
// reemplazaban al re-correr el seed. Ya está corregido).
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
// Precios en pesos uruguayos (UYU). Tamaños en mililitros (ml).
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
    basePrice: 130,
    variants: [{ name: "Individual (60ml)", price: 130, sku: "DRK-001-A" }],
  },
  {
    slug: "cyber-latte",
    name: "Cyber-Latte",
    description:
      "Latte tradicional con un toque de jarabe de lavanda casero y latte art geométrico.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.MEDIUM,
    intensity: 3,
    basePrice: 190,
    variants: [
      { name: "250ml", price: 190, sku: "DRK-002-A" },
      { name: "350ml", price: 220, sku: "DRK-002-B" },
      { name: "450ml", price: 250, sku: "DRK-002-C" },
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
    basePrice: 210,
    variants: [
      { name: "350ml", price: 210, sku: "DRK-003-A" },
      { name: "450ml", price: 240, sku: "DRK-003-B" },
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
    basePrice: 180,
    variants: [
      { name: "250ml", price: 180, sku: "DRK-004-A" },
      { name: "350ml", price: 210, sku: "DRK-004-B" },
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
    basePrice: 200,
    variants: [
      { name: "250ml", price: 200, sku: "DRK-005-A" },
      { name: "350ml", price: 230, sku: "DRK-005-B" },
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
    basePrice: 240,
    variants: [{ name: "Individual", price: 240, sku: "DRK-006-A" }],
  },
  {
    slug: "kernel-panic-cortado",
    name: "Kernel Panic Cortado",
    description:
      "Espresso cortado con leche vaporizada en partes iguales. Intenso, corto, sin errores de segmentación.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.DARK,
    intensity: 4,
    basePrice: 150,
    variants: [{ name: "Individual (120ml)", price: 150, sku: "DRK-007-A" }],
  },
  {
    slug: "git-blame-frappe",
    name: "Git Blame Frappé",
    description:
      "Café frío batido con hielo. Vas a querer culpar a alguien por lo rico que está.",
    category: ProductCategory.COFFEE,
    roastLevel: RoastLevel.LIGHT,
    intensity: 2,
    basePrice: 220,
    variants: [
      { name: "350ml", price: 220, sku: "DRK-008-A" },
      { name: "450ml", price: 250, sku: "DRK-008-B" },
    ],
  },
];

// ----------------------------------------------------------------------------
// 2. BEAN DEPLOY — bolsas de café en grano/molido, para suscripción y retail
// El peso sigue en gramos (es una medida de masa, no de volumen — no cambia).
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
    basePrice: 590,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 590, sku: "BAG-001-A" },
      { name: "250g - Molido (Filtro)", grindType: GrindType.FILTER, weightGr: 250, price: 590, sku: "BAG-001-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 1050, sku: "BAG-001-C" },
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
    basePrice: 520,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 520, sku: "BAG-002-A" },
      { name: "250g - Molido (Espresso)", grindType: GrindType.ESPRESSO, weightGr: 250, price: 520, sku: "BAG-002-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 950, sku: "BAG-002-C" },
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
    basePrice: 540,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 540, sku: "BAG-003-A" },
      { name: "250g - Molido (Espresso)", grindType: GrindType.ESPRESSO, weightGr: 250, price: 540, sku: "BAG-003-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 980, sku: "BAG-003-C" },
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
    basePrice: 480,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 480, sku: "BAG-004-A" },
      { name: "250g - Molido (Filtro)", grindType: GrindType.FILTER, weightGr: 250, price: 480, sku: "BAG-004-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 870, sku: "BAG-004-C" },
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
    basePrice: 650,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 650, sku: "BAG-005-A" },
      { name: "250g - Molido (Filtro)", grindType: GrindType.FILTER, weightGr: 250, price: 650, sku: "BAG-005-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 1180, sku: "BAG-005-C" },
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
    basePrice: 550,
    isSubscribable: true,
    variants: [
      { name: "250g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 250, price: 550, sku: "BAG-006-A" },
      { name: "250g - Molido (Espresso)", grindType: GrindType.ESPRESSO, weightGr: 250, price: 550, sku: "BAG-006-B" },
      { name: "500g - Grano entero", grindType: GrindType.WHOLE_BEAN, weightGr: 500, price: 990, sku: "BAG-006-C" },
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
    basePrice: 190,
    variants: [{ name: "Individual", price: 190, sku: "PST-001-A" }],
  },
  {
    slug: "the-cookie-exception",
    name: "The Cookie Exception",
    description: "Galleta gigante de chispas de tres tipos de chocolate, servida tibia.",
    category: ProductCategory.PASTRY,
    basePrice: 160,
    variants: [{ name: "Individual", price: 160, sku: "PST-002-A" }],
  },
  {
    slug: "opensource-toast",
    name: "OpenSource Toast",
    description:
      "Tostada de masa madre con aguacate machacado, huevo ponchado, sésamo negro y un toque de chile.",
    category: ProductCategory.PASTRY,
    basePrice: 280,
    variants: [{ name: "Individual", price: 280, sku: "PST-003-A" }],
  },
  {
    slug: "stack-trace-scone",
    name: "Stack Trace Scone",
    description: "Scone de manteca con arándanos: cada capa cuenta una parte del error.",
    category: ProductCategory.PASTRY,
    basePrice: 165,
    variants: [{ name: "Individual", price: 165, sku: "PST-004-A" }],
  },
  {
    slug: "merge-conflict-muffin",
    name: "Merge Conflict Muffin",
    description: "Muffin de chocolate y arándanos que decidieron no resolver sus diferencias.",
    category: ProductCategory.PASTRY,
    basePrice: 170,
    variants: [{ name: "Individual", price: 170, sku: "PST-005-A" }],
  },
  {
    slug: "404-croissant-not-found",
    name: "404 Croissant Not Found",
    description: "Croissant de manteca clásico. Simplemente no lo vas a encontrar en ningún otro lado.",
    category: ProductCategory.PASTRY,
    basePrice: 150,
    variants: [{ name: "Individual", price: 150, sku: "PST-006-A" }],
  },
  {
    slug: "infinite-loop-donut",
    name: "Infinite Loop Donut",
    description: "Dona glaseada con chispas de colores neón. Una vez que empezás, no parás.",
    category: ProductCategory.PASTRY,
    basePrice: 155,
    variants: [{ name: "Individual", price: 155, sku: "PST-007-A" }],
  },
  {
    slug: "buffer-overflow-bagel",
    name: "Buffer Overflow Bagel",
    description: "Bagel con queso crema, tanto que se desborda por los costados.",
    category: ProductCategory.PASTRY,
    basePrice: 210,
    variants: [{ name: "Individual", price: 210, sku: "PST-008-A" }],
  },
];

// ----------------------------------------------------------------------------
// Función reutilizable: crea O ACTUALIZA un producto y todas sus variantes.
// Con upsert + update real, correr este script de nuevo con precios nuevos
// SÍ los va a reflejar en la base de datos (antes no lo hacía).
// ----------------------------------------------------------------------------

async function seedProducts(products: ProductSeed[]) {
  for (const p of products) {
    const productData = {
      name: p.name,
      description: p.description,
      category: p.category,
      roastLevel: p.roastLevel,
      intensity: p.intensity,
      origin: p.origin,
      tastingNotes: p.tastingNotes,
      basePrice: p.basePrice,
      isSubscribable: p.isSubscribable ?? false,
    };

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: productData,
      create: { slug: p.slug, ...productData },
    });

    for (const v of p.variants) {
      const variantData = {
        name: v.name,
        grindType: v.grindType ?? GrindType.NOT_APPLICABLE,
        weightGr: v.weightGr,
        price: v.price,
        stock: v.stock ?? 50,
      };

      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: variantData,
        create: { productId: product.id, sku: v.sku, ...variantData },
      });
    }

    console.log(`  ✓ ${p.name} (${p.variants.length} variante${p.variants.length > 1 ? "s" : ""})`);
  }
}

// ----------------------------------------------------------------------------
// 4. CYBER-PODS — espacios de coworking
//
// Nota: usamos deleteMany + create (en vez de upsert) porque CyberPod no
// tiene un campo único como "slug" para identificarlo. Esto borra y vuelve
// a crear los pods cada vez que corrés el seed — seguro en desarrollo
// (todavía no hay reservas reales de usuarios apuntando a estos pods), pero
// NO es un patrón que harías así en producción.
// ----------------------------------------------------------------------------

async function seedCyberPods() {
  await prisma.cyberPod.deleteMany({});

  const pods = [
    {
      name: "Cyber-Pod Alpha",
      type: PodType.INDIVIDUAL,
      capacity: 1,
      hourlyRate: 350,
      amenities: ["Fibra simétrica 1Gbps", 'Monitor 27" 4K', "Silla ergonómica"],
    },
    {
      name: "Cyber-Pod Beta",
      type: PodType.INDIVIDUAL,
      capacity: 1,
      hourlyRate: 350,
      amenities: ["Fibra simétrica 1Gbps", 'Monitor 27" 4K', "Standing desk"],
    },
    {
      name: "War Room Gamma",
      type: PodType.GROUP,
      capacity: 4,
      hourlyRate: 950,
      amenities: [
        "Fibra simétrica 1Gbps",
        '4 monitores individuales 27" (uno por persona)',
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
// Mismo criterio que CyberPod: sin campo único, usamos deleteMany + create.
// ----------------------------------------------------------------------------

async function seedSubscriptionPlans() {
  await prisma.subscriptionPlan.deleteMany({});

  const plans = [
    {
      name: "Explorer",
      description: "Perfecto para probar sabores nuevos cada mes.",
      frequency: SubscriptionFrequency.MONTHLY,
      weightGr: 250,
      price: 690,
    },
    {
      name: "Power User",
      description: "Para quienes no pueden vivir sin su dosis quincenal.",
      frequency: SubscriptionFrequency.BIWEEKLY,
      weightGr: 250,
      price: 650,
    },
    {
      name: "Full Stack",
      description: "El plan definitivo: más café, más seguido, mejor precio por gramo.",
      frequency: SubscriptionFrequency.WEEKLY,
      weightGr: 500,
      price: 1200,
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
