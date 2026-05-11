import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
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
        className={`${spaceGrotesk.variable} bg-[#020617] text-slate-100 min-h-screen antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="overflow-x-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
