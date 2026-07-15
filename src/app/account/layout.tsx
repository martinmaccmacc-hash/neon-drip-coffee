export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <div className="mx-auto max-w-3xl">{children}</div>
    </main>
  );
}
