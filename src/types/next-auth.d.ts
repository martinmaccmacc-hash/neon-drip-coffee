import type { DefaultSession } from "next-auth";

// Por defecto, Auth.js no sabe que nuestro User tiene un campo "role" —
// esto le enseña a TypeScript que session.user.role y token.role existen,
// para que no se queje en cada archivo donde los usamos.
declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
