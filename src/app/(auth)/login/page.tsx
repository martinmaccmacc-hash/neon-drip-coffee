"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">// login.tsx</p>
      <h1 className="mt-2 mb-8 font-display text-2xl font-bold text-ink">
        Iniciar sesión
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
          />
        </div>

        {error && <p className="font-mono text-sm text-neon-pink">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-neon-purple py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-[1.02] hover:bg-neon-pink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p className="mt-6 text-center font-mono text-xs text-dim">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-neon-cyan hover:underline">
          Crear una
        </Link>
      </p>
    </div>
  );
}
