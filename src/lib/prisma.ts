// Singleton de Prisma Client.
//
// ¿Por qué no hacemos simplemente "new PrismaClient()" en cada archivo que
// lo necesite? En desarrollo, Next.js recarga módulos constantemente cada
// vez que guardás un archivo (hot reload). Sin este patrón, cada recarga
// crearía una conexión NUEVA a Supabase sin cerrar la anterior, y en poco
// tiempo agotaríamos el límite de conexiones simultáneas de la base de datos.
//
// La solución: guardamos la instancia en `globalThis` (un objeto global que
// sobrevive a los hot reloads) y la reutilizamos si ya existe.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
