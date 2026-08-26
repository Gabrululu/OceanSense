"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div
      className="flex flex-col items-center justify-center px-4 pt-32 pb-24 gap-6 min-h-dvh text-center"
      style={{ background: "var(--background)" }}
    >
      <svg width="48" height="48" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="notFoundWave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
          <clipPath id="notFoundBuoyClip">
            <circle cx="16" cy="18" r="7.5" />
          </clipPath>
        </defs>
        <rect x="15.3" y="4.5" width="1.4" height="6" fill="var(--sand)" rx="0.5" />
        <path d="M16.7 5 L23 7.2 L16.7 9.4 Z" fill="var(--primary)" />
        <g clipPath="url(#notFoundBuoyClip)">
          <rect x="8.5" y="10.5" width="15" height="15" fill="var(--sand)" />
          <rect x="8.5" y="17" width="15" height="2.6" fill="var(--background)" />
        </g>
        <circle cx="16" cy="18" r="7.5" fill="none" stroke="var(--background)" strokeWidth="1" />
        <path
          d="M4 25.5 Q8 22.5 12 25.5 T20 25.5 T28 25.5"
          fill="none"
          stroke="url(#notFoundWave)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M3 29.5 Q7.5 26.5 12 29.5 T21 29.5 T30 29.5"
          fill="none"
          stroke="url(#notFoundWave)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>

      <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
        {t.notFound.eyebrow}
      </p>

      <h1
        className="t-display-sm"
        style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
      >
        {t.notFound.title}
      </h1>

      <p className="max-w-md text-sm" style={{ color: "var(--muted-foreground)" }}>
        {t.notFound.body}
      </p>

      <Link href="/" className="btn-primary mt-2">
        {t.notFound.backHome}
      </Link>
    </div>
  );
}
