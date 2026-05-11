"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Waves } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/",        label: "Dashboard" },
  { href: "/reading", label: "Submit Reading" },
  { href: "/claim",   label: "Rewards" },
  { href: "/cpen",    label: "cPEN" },
];

export function Navbar() {
  const pathname  = usePathname();
  const isHome    = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !isHome;

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        solid
          ? "bg-[#020617]/90 border-b border-slate-800/70 backdrop-blur-md"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          suppressHydrationWarning
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
            <Waves size={15} className="text-cyan-400" />
          </div>
          <span className="text-gradient font-bold text-base tracking-tight">
            Ocean-Sense
          </span>
          <span className="hidden sm:inline text-[10px] font-semibold text-slate-600 bg-slate-800/70 border border-slate-700/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Devnet
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                pathname === link.href
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Wallet button */}
        <WalletMultiButton
          style={{
            background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
            height: "36px",
            fontSize: "13px",
            fontWeight: "700",
            borderRadius: "10px",
            padding: "0 18px",
            boxShadow: "0 0 20px rgba(8,145,178,0.3)",
            letterSpacing: "0.01em",
          }}
        />
      </div>
    </nav>
  );
}
