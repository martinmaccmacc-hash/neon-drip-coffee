// Next.js muestra este archivo automáticamente mientras `page.tsx` está
// esperando la respuesta de `await prisma.product.findMany()` — no hace
// falta ningún código extra para conectarlo, solo el nombre del archivo
// ("loading.tsx") dentro de la misma carpeta que "page.tsx".
export default function MenuLoading() {
  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <div className="mx-auto h-4 w-32 animate-pulse rounded bg-surface" />
        <div className="mx-auto mt-3 h-10 w-64 animate-pulse rounded bg-surface" />
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-line bg-surface"
          />
        ))}
      </div>
    </main>
  );
}
