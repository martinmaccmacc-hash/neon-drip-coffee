import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function AccountPage() {
  const session = await auth();

  // El proxy ya debería haber redirigido antes de llegar acá, pero
  // repetimos el chequeo del lado del servidor por las dudas — nunca
  // confiamos en una sola capa de protección.
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">// account/page.tsx</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">
        Hola, {session.user.name}
      </h1>
      <p className="mt-2 font-mono text-sm text-dim">{session.user.email}</p>
      <SignOutButton />
    </div>
  );
}
