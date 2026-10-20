// Seed de Neon Drip Coffee — npx prisma db seed
// Usa upsert para poder re-ejecutarse sin duplicar datos ni romper relaciones.

import {
  PrismaClient,
  ProductCategory,
  RoastLevel,
  GrindType,
  PodType,
  SubscriptionFrequency,
} from "@prisma/client";

const prisma = new PrismaClient();

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
  imageUrl?: string;
  variants: VariantSeed[];
};

// Foto del producto en /public/images/products (las bolsas de Bean Deploy no tienen)
const productImage = (slug: string) => `/images/products/${slug}.jpg`;

// 1. Core Brews (precios en UYU)

const coreBrews: ProductSeed[] = [
  {
    slug: "stack-overflow-espresso",
    imageUrl: productImage("stack-overflow-espresso"),
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
    imageUrl: productImage("cyber-latte"),
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
    imageUrl: productImage("cold-brew-null-pointer"),
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
    imageUrl: productImage("the-monolith-cappuccino"),
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
    imageUrl: productImage("404-mocha-not-found"),
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
    imageUrl: productImage("async-affogato"),
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
    imageUrl: productImage("kernel-panic-cortado"),
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
    imageUrl: productImage("git-blame-frappe"),
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

// 2. Bean Deploy — bolsas de café

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

// 3. Byte-Sized Bites

const pastries: ProductSeed[] = [
  {
    slug: "glitch-brownie",
    imageUrl: productImage("glitch-brownie"),
    name: "Glitch Brownie",
    description:
      "Brownie de chocolate belga con hilos de chocolate rosa y polvo de oro comestible.",
    category: ProductCategory.PASTRY,
    basePrice: 190,
    variants: [{ name: "Individual", price: 190, sku: "PST-001-A" }],
  },
  {
    slug: "the-cookie-exception",
    imageUrl: productImage("the-cookie-exception"),
    name: "The Cookie Exception",
    description: "Galleta gigante de chispas de tres tipos de chocolate, servida tibia.",
    category: ProductCategory.PASTRY,
    basePrice: 160,
    variants: [{ name: "Individual", price: 160, sku: "PST-002-A" }],
  },
  {
    slug: "opensource-toast",
    imageUrl: productImage("opensource-toast"),
    name: "OpenSource Toast",
    description:
      "Tostada de masa madre con aguacate machacado, huevo ponchado, sésamo negro y un toque de chile.",
    category: ProductCategory.PASTRY,
    basePrice: 280,
    variants: [{ name: "Individual", price: 280, sku: "PST-003-A" }],
  },
  {
    slug: "stack-trace-scone",
    imageUrl: productImage("stack-trace-scone"),
    name: "Stack Trace Scone",
    description: "Scone de manteca con arándanos: cada capa cuenta una parte del error.",
    category: ProductCategory.PASTRY,
    basePrice: 165,
    variants: [{ name: "Individual", price: 165, sku: "PST-004-A" }],
  },
  {
    slug: "merge-conflict-muffin",
    imageUrl: productImage("merge-conflict-muffin"),
    name: "Merge Conflict Muffin",
    description: "Muffin de chocolate y arándanos que decidieron no resolver sus diferencias.",
    category: ProductCategory.PASTRY,
    basePrice: 170,
    variants: [{ name: "Individual", price: 170, sku: "PST-005-A" }],
  },
  {
    slug: "404-croissant-not-found",
    imageUrl: productImage("404-croissant-not-found"),
    name: "404 Croissant Not Found",
    description: "Croissant de manteca clásico. Simplemente no lo vas a encontrar en ningún otro lado.",
    category: ProductCategory.PASTRY,
    basePrice: 150,
    variants: [{ name: "Individual", price: 150, sku: "PST-006-A" }],
  },
  {
    slug: "infinite-loop-donut",
    imageUrl: productImage("infinite-loop-donut"),
    name: "Infinite Loop Donut",
    description:
      "Dona esponjosa con glaseado rosa y chispas de colores neón. Una vez que empezás, no parás.",
    category: ProductCategory.PASTRY,
    basePrice: 155,
    variants: [{ name: "Individual", price: 155, sku: "PST-007-A" }],
  },
  {
    slug: "buffer-overflow-bagel",
    imageUrl: productImage("buffer-overflow-bagel"),
    name: "Buffer Overflow Bagel",
    description: "Bagel con queso crema, tanto que se desborda por los costados.",
    category: ProductCategory.PASTRY,
    basePrice: 210,
    variants: [{ name: "Individual", price: 210, sku: "PST-008-A" }],
  },
];

// Crea o actualiza un producto y sus variantes

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
      imageUrl: p.imageUrl ?? null,
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

// 4. Cyber-Pods
// Upsert por nombre: los pods pueden tener reservas asociadas.

// Ficha técnica de los Cyber-Pod Alpha
const ALPHA_SPECS = `💻 Hardware de alto rendimiento
- CPU: Intel Core i7 / AMD Ryzen 7 (generación reciente)
- RAM: 16 GB o 32 GB de alta velocidad
- Almacenamiento: SSD NVMe M.2 ultra rápido

🖥️ Espacio visual y conectividad
- Monitor 27" QHD (2K)
- Cable USB-C con soporte de video y carga

⌨️ Periféricos
- Teclado mecánico o de perfil bajo, ANSI/ISO configurable
- Ratón ergonómico de alta precisión
- Hub USB accesible en mesa

🪑 Silla ergonómica profesional — Modelo Pro-Tech
Soporte lumbar ajustable, reposabrazos 4D, espuma de alta densidad, malla transpirable.`;

// Ficha técnica de War Room Gamma
const GAMMA_SPECS = `💻 Hardware de alto rendimiento (x4 puestos)
- CPU: Intel Core i7 / AMD Ryzen 7 (generación reciente)
- RAM: 16 GB o 32 GB de alta velocidad
- Almacenamiento: SSD NVMe M.2 ultra rápido

🖥️ Espacio visual y conectividad
- 4 monitores individuales 27" QHD (2K), uno por puesto
- Cable USB-C con soporte de video y carga en cada puesto

⌨️ Periféricos (por puesto)
- Teclado mecánico o de perfil bajo, ANSI/ISO configurable
- Ratón ergonómico de alta precisión
- Hub USB accesible en mesa

👥 Equipamiento de sala grupal
- Pizarra digital interactiva
- 4 sillas ergonómicas profesionales — Modelo Pro-Tech`;

const ALPHA_AMENITIES = [
  "CPU Intel i7 / Ryzen 7",
  "16-32 GB RAM",
  "SSD NVMe M.2",
  'Monitor 27" QHD',
  "Silla ergonómica Pro-Tech",
];

const GAMMA_AMENITIES = [
  "4 puestos individuales",
  '4 monitores 27" QHD',
  "Pizarra digital",
  "4 sillas ergonómicas Pro-Tech",
];

async function seedCyberPods() {
  const pods = [
    {
      name: "Cyber-Pod Alpha-1",
      type: PodType.INDIVIDUAL,
      capacity: 1,
      hourlyRate: 250,
      // 3 horas o más: $200/hora para toda la reserva
      discountedHourlyRate: 200,
      discountFromHours: 3,
      amenities: ALPHA_AMENITIES,
      specsNote: ALPHA_SPECS,
      imageUrl: "/images/cyber-pod-alpha.jpg",
    },
    {
      name: "Cyber-Pod Alpha-2",
      type: PodType.INDIVIDUAL,
      capacity: 1,
      hourlyRate: 250,
      discountedHourlyRate: 200,
      discountFromHours: 3,
      amenities: ALPHA_AMENITIES,
      specsNote: ALPHA_SPECS,
      imageUrl: "/images/cyber-pod-alpha.jpg",
    },
    {
      name: "Cyber-Pod Alpha-3",
      type: PodType.INDIVIDUAL,
      capacity: 1,
      hourlyRate: 250,
      discountedHourlyRate: 200,
      discountFromHours: 3,
      amenities: ALPHA_AMENITIES,
      specsNote: ALPHA_SPECS,
      imageUrl: "/images/cyber-pod-alpha.jpg",
    },
    {
      name: "War Room Gamma",
      type: PodType.GROUP,
      capacity: 4,
      hourlyRate: 800,
      discountedHourlyRate: null,
      discountFromHours: null,
      amenities: GAMMA_AMENITIES,
      specsNote: GAMMA_SPECS,
      imageUrl: "/images/pod-gamma.jpg",
    },
  ];

  for (const pod of pods) {
    await prisma.cyberPod.upsert({
      where: { name: pod.name },
      update: pod,
      create: pod,
    });
    console.log(`  ✓ ${pod.name}`);
  }

  // Los pods viejos se desactivan (no se borran) porque pueden tener reservas históricas
  const nombresViejos = ["Cyber-Pod Alpha", "Cyber-Pod Beta"];
  const { count } = await prisma.cyberPod.updateMany({
    where: { name: { in: nombresViejos } },
    data: { isActive: false },
  });
  if (count > 0) {
    console.log(`  ⏸️  ${count} pod(s) viejo(s) desactivado(s): ${nombresViejos.join(", ")}`);
  }
}

// 5. Planes de suscripción (Bean Deploy)

async function seedSubscriptionPlans() {
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
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✓ ${plan.name}`);
  }
}

// Main

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
