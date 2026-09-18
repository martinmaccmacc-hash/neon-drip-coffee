import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { BookingCalendar } from "@/components/coworking/booking-calendar";
import { PodSpecs } from "@/components/coworking/pod-specs";

export default async function CyberPodPage({
  params,
}: {
  params: Promise<{ podId: string }>;
}) {
  const { podId } = await params;

  const pod = await prisma.cyberPod.findUnique({ where: { id: podId } });

  if (!pod || !pod.isActive) {
    notFound();
  }

  const session = await auth();

  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <section>
          <p className="font-mono text-sm text-neon-cyan">
            // {pod.name.toLowerCase().replace(/\s+/g, "-")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">
            {pod.name}
          </h1>
          <p className="mt-1 font-mono text-xs uppercase text-neon-pink">
            {pod.type === "INDIVIDUAL" ? "Individual" : "Grupal"} ·{" "}
            {pod.capacity} {pod.capacity === 1 ? "persona" : "personas"}
          </p>

          <ul className="mt-6 space-y-2 border-t border-line pt-6">
            {pod.amenities.map((amenity) => (
              <li key={amenity} className="font-mono text-sm text-dim">
                · {amenity}
              </li>
            ))}
          </ul>

          <PodSpecs specsNote={pod.specsNote} />

          <div className="mt-6 flex justify-between border-t border-line pt-4">
            <span className="text-dim">Precio</span>
            <span className="font-display text-lg font-bold text-neon-cyan">
              {formatPrice(Number(pod.hourlyRate))}
              <span className="font-mono text-xs font-normal text-dim">
                /hora
              </span>
            </span>
          </div>
        </section>

        <section>
          {session?.user ? (
            <BookingCalendar
              pod={{
                id: pod.id,
                name: pod.name,
                hourlyRate: Number(pod.hourlyRate),
                capacity: pod.capacity,
              }}
            />
          ) : (
            <div className="rounded-xl border border-line bg-surface p-6 text-center">
              <p className="font-mono text-sm text-dim">
                Tenés que iniciar sesión para reservar este espacio.
              </p>
              <Link
                href={`/login?callbackUrl=/coworking/${pod.id}`}
                className="mt-4 inline-block rounded-lg bg-neon-purple px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
              >
                Iniciar sesión
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
