import type { NextAuthConfig } from "next-auth";

// Config "liviana", compatible con el Edge Runtime (donde corre proxy.ts).
// A propósito NO importa Prisma acá — Prisma necesita Node.js completo, y
// el Edge Runtime es un entorno más restringido. Esta config solo decide
// "¿esta persona puede pasar a esta ruta?", no cómo se loguea.
export default {
  pages: {
    signIn: "/login",
  },
  providers: [], // Los providers reales (Credentials) van en auth.ts.
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isProtectedRoute =
        pathname.startsWith("/account") || pathname.startsWith("/admin");

      if (isProtectedRoute && !isLoggedIn) {
        return false; // Auth.js redirige automáticamente a /login
      }

      // /admin además requiere el rol ADMIN (nadie lo tiene por defecto;
      // se asigna a mano en la base de datos cuando construyamos ese panel).
      if (pathname.startsWith("/admin") && auth?.user?.role !== "ADMIN") {
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
