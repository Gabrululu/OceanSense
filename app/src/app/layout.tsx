import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/Preloader";
import { LanguageProvider } from "@/components/LanguageProvider";

// Variable font with optical size + SOFT axes
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-fraunces-loaded",
  display: "swap",
});

// Inter as the sans body font (closest widely available match)
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter-loaded",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ocean-Sense — DePIN Ocean Monitoring on Solana",
  description:
    "Decentralized ocean monitoring network for Peru's coastline. IoT buoys operated by artisanal fishers, rewarded in cPEN on Solana.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Ocean-Sense — DePIN Ocean Monitoring on Solana",
    description:
      "Decentralized ocean monitoring network for Peru's coastline. IoT buoys operated by artisanal fishers, rewarded in cPEN on Solana.",
    images: [{ url: "/logo-512.png", width: 512, height: 512 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} min-h-dvh`}
        style={
          {
            "--font-display": `var(--font-fraunces-loaded), "Times New Roman", serif`,
            "--font-sans": `var(--font-inter-loaded), ui-sans-serif, system-ui, sans-serif`,
            "--font-mono": `var(--font-jetbrains-loaded), ui-monospace, monospace`,
          } as React.CSSProperties
        }
      >
        <LanguageProvider>
          <Preloader />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-[0.18em]"
            style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
          >
            Skip to content
          </a>
          <Providers>
            <Navbar />
            <main id="main-content" className="overflow-x-hidden">{children}</main>
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
