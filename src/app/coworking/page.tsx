import { prisma } from "@/lib/prisma";
import { PodCard } from "@/components/coworking/pod-card";

export default async function CoworkingPage() {
  const pods = await prisma.cyberPod.findMany({
    where: { isActive: true },
    orderBy: { hourlyRate: "asc" },
  });

  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <header className="mx-auto mb-16 max-w-2xl text-center">
        <p className="font-mono text-sm text-neon-cyan">// coworking.tsx</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide text-ink md:text-5xl">
          Cyber-Pods
        </h1>
        <p className="mt-4 text-dim">
          Espacios de coworking con internet simétrico de fibra óptica.
          Reservá tu lugar y desplegá tu próximo proyecto.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pods.map((pod) => (
          <PodCard key={pod.id} pod={pod} />
        ))}
      </div>
    </main>
  );
}
