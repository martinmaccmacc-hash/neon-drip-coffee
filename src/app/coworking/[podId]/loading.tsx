export default function CyberPodLoading() {
  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border border-line bg-surface" />
        <div className="h-96 animate-pulse rounded-xl border border-line bg-surface" />
      </div>
    </main>
  );
}
