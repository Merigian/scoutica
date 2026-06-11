import type { Metadata } from "next";
import { Fraunces, Inter_Tight, Bodoni_Moda, Archivo } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter-tight",
  weight: ["400", "500", "600"],
  display: "swap",
});

// ── Atelier Noir redesign — display Didone + grotesque body ──
const bodoni = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bodoni",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-archivo",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Scoutica — La piattaforma italiana per lo scouting professionale",
    template: "%s | Scoutica",
  },
  description:
    "La piattaforma professionale che connette modelli con scout, agenzie e brand verificati in Italia.",
  keywords: ["scouting", "modelli", "moda", "italia", "agenzia", "casting", "fashion"],
  authors: [{ name: "Scoutica" }],
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/images/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/images/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://scoutica.it",
    siteName: "Scoutica",
    title: "Scoutica — La piattaforma italiana per lo scouting professionale",
    description:
      "La piattaforma professionale che connette modelli con scout, agenzie e brand verificati in Italia.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Scoutica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scoutica — La piattaforma italiana per lo scouting professionale",
    description:
      "La piattaforma professionale che connette modelli con scout, agenzie e brand verificati in Italia.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={`theme-noir ${fraunces.variable} ${interTight.variable} ${bodoni.variable} ${archivo.variable}`}>
      <body className="min-h-screen antialiased">
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
