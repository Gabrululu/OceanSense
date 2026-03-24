"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Waves } from "lucide-react";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/",        label: "Dashboard" },
  { href: "/reading", label: "Enviar lectura" },
  { href: "/claim",   label: "Recompensas" },
  { href: "/cpen",    label: "cPEN" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-cyan-400" suppressHydrationWarning>
          <Waves size={20} />
          <span>Ocean-Sense</span>
          <span className="text-xs text-slate-500 font-normal hidden sm:inline">
            Devnet
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === link.href
                  ? "bg-cyan-500/15 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Wallet */}
        <WalletMultiButton
          style={{
            backgroundColor: "#0891b2",
            height: "36px",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "0 16px",
          }}
        />
      </div>
    </nav>
  );
}