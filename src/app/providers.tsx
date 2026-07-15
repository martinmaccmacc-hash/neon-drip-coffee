"use client";

import { SessionProvider } from "next-auth/react";

// SessionProvider tiene que envolver toda la app para que hooks como
// useSession() (que usamos en el Navbar) funcionen en cualquier componente.
// Tiene que ser un Client Component aparte porque usa Context de React,
// algo que un Server Component no puede hacer.
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
