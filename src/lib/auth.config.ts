import type { NextAuthConfig } from "next-auth";

// Config compatible con el Edge Runtime (sin Prisma), usada por proxy.ts
export default {
  // Confía en el host de la request (necesario con `npm start` fuera de Vercel)
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [], // Credentials se configura en auth.ts
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isProtectedRoute =
        pathname.startsWith("/account") || pathname.startsWith("/admin");

      if (isProtectedRoute && !isLoggedIn) {
        return false;
      }

      // /admin requiere rol ADMIN
      if (pathname.startsWith("/admin") && auth?.user?.role !== "ADMIN") {
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
