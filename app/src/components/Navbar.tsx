"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export function Navbar() {
  const pathname  = usePathname();
  const isHome    = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const NAV_LINKS = [
    { href: "/",        label: t.nav.dashboard },
    { href: "/reading", label: t.nav.submitReading },
    { href: "/claim",   label: t.nav.rewards },
    { href: "/cpen",    label: t.nav.cpen },
    { href: "/data",    label: t.nav.dataAccess },
  ];

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
          ? "rgba(11, 19, 43, 0.85)"
          : "transparent",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
          suppressHydrationWarning
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            className="shrink-0 transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="navWave" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--primary)" />
              </linearGradient>
              <clipPath id="navBuoyClip">
                <circle cx="16" cy="18" r="7.5" />
              </clipPath>
            </defs>
            <rect x="15.3" y="4.5" width="1.4" height="6" fill="var(--sand)" rx="0.5" />
            <path d="M16.7 5 L23 7.2 L16.7 9.4 Z" fill="var(--primary)" />
            <g clipPath="url(#navBuoyClip)">
              <rect x="8.5" y="10.5" width="15" height="15" fill="var(--sand)" />
              <rect x="8.5" y="17" width="15" height="2.6" fill="var(--background)" />
            </g>
            <circle cx="16" cy="18" r="7.5" fill="none" stroke="var(--background)" strokeWidth="1" />
            <path
              d="M4 25.5 Q8 22.5 12 25.5 T20 25.5 T28 25.5"
              fill="none"
              stroke="url(#navWave)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M3 29.5 Q7.5 26.5 12 29.5 T21 29.5 T30 29.5"
              fill="none"
              stroke="url(#navWave)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.55"
            />
          </svg>
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
            {t.nav.devnet}
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

        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            aria-label="Toggle language"
            className="flex items-center border text-[10px] uppercase tracking-[0.15em] overflow-hidden shrink-0"
            style={{ fontFamily: "var(--font-mono)", borderColor: "var(--border)", height: "34px" }}
          >
            <span
              className="px-2.5 h-full flex items-center transition-colors"
              style={{
                background: lang === "en" ? "var(--accent)" : "transparent",
                color: lang === "en" ? "var(--accent-foreground)" : "var(--muted-foreground)",
              }}
            >
              EN
            </span>
            <span
              className="px-2.5 h-full flex items-center transition-colors border-l"
              style={{
                background: lang === "es" ? "var(--accent)" : "transparent",
                color: lang === "es" ? "var(--accent-foreground)" : "var(--muted-foreground)",
                borderColor: "var(--border)",
              }}
            >
              ES
            </span>
          </button>

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
      </div>
    </nav>
  );
}
