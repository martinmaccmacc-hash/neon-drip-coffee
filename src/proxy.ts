import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

// Instancia liviana de Auth.js: usa SOLO authConfig (sin Prisma), porque
// este archivo corre en el Edge Runtime, donde Prisma no puede funcionar.
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  // Corre en todas las rutas EXCEPTO las de archivos internos de Next.js
  // y los assets estáticos (no tiene sentido "proteger" una imagen o un
  // ícono, y sería un desperdicio de recursos evaluarlo en cada uno).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
