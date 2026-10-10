import Image from "next/image";

// Foto del pod, o placeholder con estilo de marca si no tiene imagen
export function PodImage({
  imageUrl,
  name,
  className = "",
  sizes = "(min-width: 1024px) 480px, (min-width: 640px) 50vw, calc(100vw - 48px)",
  priority = false,
}: {
  imageUrl: string | null;
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`Interior de ${name}`}
          fill
          sizes={sizes}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-neon-purple/25 via-surface to-neon-cyan/20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <span className="relative font-display text-lg font-bold uppercase tracking-wide text-ink">
            {name}
          </span>
          <span className="relative font-mono text-xs text-dim">
            {"// foto próximamente"}
          </span>
        </div>
      )}
    </div>
  );
}
