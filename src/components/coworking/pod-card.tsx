import Link from "next/link";
import type { CyberPod } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { PodImage } from "./pod-image";

export function PodCard({
  pod,
  displayName,
  unitCount = 1,
}: {
  pod: CyberPod;
  displayName?: string;
  unitCount?: number;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-neon-cyan/60">
      <div className="relative">
        <PodImage
          imageUrl={pod.imageUrl}
          name={displayName ?? pod.name}
          className="aspect-[4/3] border-b border-line"
        />
        {unitCount > 1 && (
          <span className="absolute right-3 top-3 rounded-full border border-neon-cyan/50 bg-void/80 px-3 py-1 font-mono text-xs text-neon-cyan backdrop-blur">
            {unitCount} pods
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-display text-xl font-bold text-ink">
          {displayName ?? pod.name}
        </h2>
        <p className="mt-1 font-mono text-xs uppercase text-neon-pink">
          {pod.type === "INDIVIDUAL" ? "Individual" : "Grupal"} ·{" "}
          {pod.capacity} {pod.capacity === 1 ? "persona" : "personas"}
        </p>

        <ul className="mt-4 flex-1 space-y-1">
          {pod.amenities.map((amenity) => (
            <li key={amenity} className="font-mono text-xs text-dim">
              · {amenity}
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-line pt-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-neon-cyan">
              {formatPrice(Number(pod.hourlyRate))}
              <span className="font-mono text-xs font-normal text-dim">
                /hora
              </span>
            </span>
            <Link
              href={`/coworking/${pod.id}`}
              className="rounded-lg bg-neon-purple px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-void transition-transform hover:scale-105 hover:bg-neon-pink"
            >
              Reservar
            </Link>
          </div>
          {pod.discountedHourlyRate != null && pod.discountFromHours != null && (
            <p className="mt-1 font-mono text-xs text-neon-pink">
              Desde {pod.discountFromHours}hs: {formatPrice(Number(pod.discountedHourlyRate))}/hora
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
