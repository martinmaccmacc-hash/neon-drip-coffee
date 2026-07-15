"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="mt-6 rounded-lg border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-dim transition-colors hover:border-neon-pink hover:text-neon-pink"
    >
      Cerrar sesión
    </button>
  );
}
