import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-void px-6 py-16 md:px-12">
      <div className="mx-auto max-w-4xl">
        <AccountNav />
        {children}
      </div>
    </main>
  );
}
