import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PodCard } from "@/components/coworking/pod-card";
import { groupPods } from "@/lib/coworking-groups";

export const metadata: Metadata = {
  title: "Cyber-Pods — Coworking",
  description:
    "Reservá un Cyber-Pod individual o la sala grupal War Room Gamma: equipos de alto rendimiento, monitor 27\" QHD y fibra óptica simétrica en Montevideo.",
  alternates: { canonical: "/coworking" },
};

// Revalida cada 5 minutos para reflejar cambios de la base de datos
export const revalidate = 300;

export default async function CoworkingPage() {
  const pods = await prisma.cyberPod.findMany({
    where: { isActive: true },
    orderBy: [{ hourlyRate: "asc" }, { name: "asc" }],
  });

  // Agrupa pods idénticos en una sola tarjeta
  const groups = groupPods(pods);

  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <header className="mx-auto mb-16 max-w-2xl text-center">
        <p className="font-mono text-sm text-neon-cyan">{"// coworking.tsx"}</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-ink md:text-5xl">
          Cyber-Pods
        </h1>
        <p className="mt-4 text-dim">
          Espacios de coworking con internet simétrico de fibra óptica.
          Reservá tu lugar y desplegá tu próximo proyecto.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
        {groups.map((group) => (
          <PodCard
            key={group.name}
            pod={group.pods[0]}
            displayName={group.name}
            unitCount={group.pods.length}
          />
        ))}
      </div>
    </main>
  );
}
