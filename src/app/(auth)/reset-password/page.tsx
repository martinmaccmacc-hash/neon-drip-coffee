"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/actions/auth.actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <p className="font-mono text-sm text-neon-pink">
          Este link no es válido o le falta el token.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block font-mono text-xs text-neon-cyan hover:underline"
        >
          Pedir un link nuevo
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword({ token: token as string, password });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/login");
  }

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">{"// reset-password.tsx"}</p>
      <h1 className="mt-2 mb-6 font-display text-2xl font-bold text-ink">
        Nueva contraseña
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="reset-password"
            className="mb-1 block font-mono text-xs text-dim"
          >
            Nueva contraseña
          </label>
          <input
            id="reset-password"
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
          />
        </div>
        <div>
          <label
            htmlFor="reset-password-confirm"
            className="mb-1 block font-mono text-xs text-dim"
          >
            Confirmar contraseña
          </label>
          <input
            id="reset-password-confirm"
            autoComplete="new-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
          />
        </div>

        {error && (
        <p role="alert" className="font-mono text-sm text-neon-pink">
          {error}
        </p>
      )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-neon-purple py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-[1.02] hover:bg-neon-pink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
