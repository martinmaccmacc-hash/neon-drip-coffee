import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

// Instancia liviana para el Edge Runtime (sin Prisma)
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  // Excluye rutas internas de Next.js y assets estáticos
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
