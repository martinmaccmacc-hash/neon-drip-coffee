// Ficha técnica: bloques separados por línea en blanco; la primera línea es el título

export function PodSpecs({ specsNote }: { specsNote: string | null }) {
  if (!specsNote) return null;

  const bloques = specsNote.split("\n\n").map((bloque) => {
    const [titulo, ...detalle] = bloque.split("\n");
    return { titulo, detalle };
  });

  return (
    <div className="mt-6 border-t border-line pt-6">
      <h2 className="font-mono text-xs uppercase tracking-wide text-neon-cyan">
        Especificaciones técnicas
      </h2>
      <div className="mt-4 space-y-4">
        {bloques.map((bloque) => (
          <div key={bloque.titulo}>
            <p className="font-mono text-sm font-semibold text-ink">
              {bloque.titulo}
            </p>
            {bloque.detalle.map((linea, i) => (
              <p key={i} className="font-mono text-xs text-dim">
                {linea}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
