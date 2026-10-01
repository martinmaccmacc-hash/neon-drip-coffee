import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { BookingCalendar } from "@/components/coworking/booking-calendar";
import { PodSpecs } from "@/components/coworking/pod-specs";
import { PodImage } from "@/components/coworking/pod-image";
import { podGroupName, podUnitLabel } from "@/lib/coworking-groups";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ podId: string }>;
}): Promise<Metadata> {
  const { podId } = await params;
  const pod = await prisma.cyberPod.findUnique({ where: { id: podId } });
  if (!pod) return { title: "Espacio no encontrado" };

  // Las unidades de un grupo comparten página: canonical a la primera
  const name = podGroupName(pod.name);
  const first = await prisma.cyberPod.findFirst({
    where: { isActive: true, name: { startsWith: name } },
    orderBy: { name: "asc" },
    select: { id: true },
  });

  return {
    title: `${name} — Reservá tu Cyber-Pod`,
    description: `${name}: ${pod.amenities.join(", ")}. Reservá por hora en Neon Drip Coffee, Montevideo.`,
    alternates: { canonical: `/coworking/${first?.id ?? pod.id}` },
  };
}

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

  // Pods del mismo grupo, para elegir la unidad al reservar
  const groupName = podGroupName(pod.name);
  const siblings = (
    await prisma.cyberPod.findMany({
      where: { isActive: true, name: { startsWith: groupName } },
      orderBy: { name: "asc" },
    })
  ).filter((p) => podGroupName(p.name) === groupName);
  const isGroup = siblings.length > 1;
  const title = isGroup ? groupName : pod.name;

  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <section>
          <PodImage
            imageUrl={pod.imageUrl}
            name={title}
            priority
            sizes="(min-width: 768px) 448px, 100vw"
            className="mb-8 aspect-[4/3] rounded-2xl border border-line"
          />
          <p className="font-mono text-sm text-neon-cyan">
            {"// "}{title.toLowerCase().replace(/\s+/g, "-")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">
            {title}
          </h1>
          <p className="mt-1 font-mono text-xs uppercase text-neon-pink">
            {pod.type === "INDIVIDUAL" ? "Individual" : "Grupal"} ·{" "}
            {pod.capacity} {pod.capacity === 1 ? "persona" : "personas"}
            {isGroup && ` · ${siblings.length} pods disponibles`}
          </p>

          <ul className="mt-6 space-y-2 border-t border-line pt-6">
            {pod.amenities.map((amenity) => (
              <li key={amenity} className="font-mono text-sm text-dim">
                · {amenity}
              </li>
            ))}
          </ul>

          <PodSpecs specsNote={pod.specsNote} />

          <div className="mt-6 border-t border-line pt-4">
            <div className="flex justify-between">
              <span className="text-dim">Precio</span>
              <span className="font-display text-lg font-bold text-neon-cyan">
                {formatPrice(Number(pod.hourlyRate))}
                <span className="font-mono text-xs font-normal text-dim">
                  /hora
                </span>
              </span>
            </div>
            {pod.discountedHourlyRate != null && pod.discountFromHours != null && (
              <p className="mt-1 text-right font-mono text-xs text-neon-pink">
                Desde {pod.discountFromHours}hs: {formatPrice(Number(pod.discountedHourlyRate))}/hora
              </p>
            )}
          </div>
        </section>

        <section>
          {session?.user ? (
            <BookingCalendar
              units={
                isGroup
                  ? siblings.map((p) => ({ id: p.id, label: podUnitLabel(p.name) }))
                  : undefined
              }
              pod={{
                id: pod.id,
                name: pod.name,
                hourlyRate: Number(pod.hourlyRate),
                capacity: pod.capacity,
                discountedHourlyRate:
                  pod.discountedHourlyRate != null ? Number(pod.discountedHourlyRate) : null,
                discountFromHours: pod.discountFromHours,
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
