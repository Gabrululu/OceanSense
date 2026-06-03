import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/Preloader";

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
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} min-h-screen`}
        style={
          {
            "--font-display": `var(--font-fraunces-loaded), "Times New Roman", serif`,
            "--font-sans": `var(--font-inter-loaded), ui-sans-serif, system-ui, sans-serif`,
            "--font-mono": `var(--font-jetbrains-loaded), ui-monospace, monospace`,
          } as React.CSSProperties
        }
      >
        <Preloader />
        <Providers>
          <Navbar />
          <main className="overflow-x-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
