import Link from "next/link";
import type { CyberPod } from "@prisma/client";
import { formatPrice } from "@/lib/utils";

export function PodCard({ pod }: { pod: CyberPod }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-6">
      <div className="flex items-center gap-1.5 pb-4">
        <span className="h-2.5 w-2.5 rounded-full bg-neon-pink/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-cyan/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-purple/70" />
      </div>

      <h2 className="font-display text-xl font-bold text-ink">{pod.name}</h2>
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

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
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
    </div>
  );
}
