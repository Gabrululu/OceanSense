"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b",
        solid
          ? "border-[var(--border)]"
          : "border-transparent"
      )}
      style={{
        background: solid
          ? "rgba(15, 30, 38, 0.85)"
          : "transparent",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 group"
          suppressHydrationWarning
        >
          <span className="relative h-2.5 w-2.5">
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-60"
              style={{ background: "var(--accent)" }}
            />
            <span
              className="relative block h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--accent)" }}
            />
          </span>
          <span
            className="text-xl tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 380,
              color: "var(--foreground)",
            }}
          >
            Ocean·Sense
          </span>
          <span
            className="hidden sm:inline text-[9px] uppercase tracking-[0.18em] border px-2 py-0.5"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--muted-foreground)",
              borderColor: "var(--border)",
            }}
          >
            Devnet
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-xs uppercase tracking-[0.18em] transition-colors duration-150",
                pathname === link.href
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {link.label}
              {pathname === link.href && (
                <span
                  className="block mt-0.5 h-px w-full"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Wallet button */}
        <WalletMultiButton
          style={{
            background: "var(--accent)",
            color: "var(--accent-foreground)",
            height: "34px",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            fontWeight: "500",
            borderRadius: "0",
            padding: "0 18px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            boxShadow: "none",
          }}
        />
      </div>
    </nav>
  );
}
