"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth.actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    await requestPasswordReset({ email });
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="font-mono text-sm text-neon-cyan">{"// listo"}</p>
        <h1 className="mt-2 font-display text-xl font-bold text-ink">
          Revisá tu email
        </h1>
        <p className="mt-3 text-sm text-dim">
          Si <span className="text-ink">{email}</span> tiene una cuenta con
          nosotros, te mandamos un link para resetear tu contraseña. Puede
          tardar unos minutos en llegar.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block font-mono text-xs text-neon-cyan hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">
        {"// forgot-password.tsx"}
      </p>
      <h1 className="mt-2 mb-6 font-display text-2xl font-bold text-ink">
        Recuperar contraseña
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="forgot-email"
            className="mb-1 block font-mono text-xs text-dim"
          >
            Email
          </label>
          <input
            id="forgot-email"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-neon-purple py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-[1.02] hover:bg-neon-pink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Enviando..." : "Enviar link de recuperación"}
        </button>
      </form>
      <p className="mt-6 text-center font-mono text-xs text-dim">
        <Link href="/login" className="text-neon-cyan hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
