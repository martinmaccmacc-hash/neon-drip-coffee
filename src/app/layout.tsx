import type { Metadata } from "next";
import { Orbitron, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import "./globals.css";

// Tres fuentes, tres roles distintos (no usamos la misma para todo):
// - Orbitron: para títulos y precios. Geométrica y futurista, da la
//   personalidad "synthwave" del local.
// - IBM Plex Sans: para descripciones y texto largo, donde Orbitron
//   sería difícil de leer.
// - IBM Plex Mono: para SKUs, notas de sabor, badges — todo lo que
//   queremos que se sienta "a código", coherente con la temática dev.
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

export const metadata: Metadata = {
  title: "Neon Drip Coffee",
  description: "Fueled by Caffeine, Driven by Code.",
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
        <Navbar />
        {children}
        {/* CartDrawer vive acá, al mismo nivel que el contenido de la
            página, para poder "flotar" por encima de cualquier página
            sin importar en cuál esté parado el usuario. */}
        <CartDrawer />
      </body>
    </html>
  );
}
