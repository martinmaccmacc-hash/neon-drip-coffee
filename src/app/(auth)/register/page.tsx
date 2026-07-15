"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth.actions";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await registerUser(form);

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    // Registro exitoso: lo logueamos automáticamente, sin hacerlo escribir
    // sus datos dos veces.
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setIsSubmitting(false);
    router.push("/account");
    router.refresh();
  }

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">// register.tsx</p>
      <h1 className="mt-2 mb-8 font-display text-2xl font-bold text-ink">
        Crear cuenta
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs text-dim">
            Nombre completo
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-dim">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-dim">
            Contraseña
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
          />
        </div>

        {error && <p className="font-mono text-sm text-neon-pink">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-neon-purple py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-[1.02] hover:bg-neon-pink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-6 text-center font-mono text-xs text-dim">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-neon-cyan hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
