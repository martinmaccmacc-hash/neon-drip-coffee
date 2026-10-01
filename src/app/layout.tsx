import type { Metadata } from "next";
import { Orbitron, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SITE, SITE_URL } from "@/lib/site-config";
import { CartDrawer } from "@/components/cart/cart-drawer";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const TITLE = "Neon Drip Coffee — Fueled by Caffeine, Driven by Code.";
const DESCRIPTION =
  "Cafetería de especialidad cyberpunk en Montevideo. Pedí y retirá en 10 minutos, recibí café de especialidad en tu casa o reservá un Cyber-Pod para programar.";

export const metadata: Metadata = {
  // Base para las URLs absolutas de Open Graph
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: DESCRIPTION,
  applicationName: SITE.name,
  keywords: [
    "cafetería de especialidad",
    "café Montevideo",
    "coworking Montevideo",
    "suscripción de café",
    "Click & Collect",
    "cyberpunk",
  ],
  openGraph: {
    type: "website",
    locale: "es_UY",
    siteName: SITE.name,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${orbitron.variable} ${plexSans.variable} ${plexMono.variable} font-body antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
