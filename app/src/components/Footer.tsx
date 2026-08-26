"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t mt-32" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-12 gap-y-10 gap-x-6">
        <div className="col-span-2 md:col-span-5">
          <p
            className="text-5xl md:text-7xl leading-[0.95] text-balance"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 380,
              letterSpacing: "-0.035em",
            }}
          >
            {t.footer.tagline1}<br />{t.footer.tagline2}
          </p>
          <p className="mt-6 max-w-md text-sm" style={{ color: "var(--muted-foreground)" }}>
            {t.footer.publicGood}
          </p>
        </div>

        <div className="md:col-span-3 md:col-start-7">
          <p
            className="text-xs uppercase tracking-[0.18em] mb-5"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
          >
            {t.footer.protocol}
          </p>
          <ul className="space-y-0">
            {[
              { href: "/",        ...t.footer.links[0] },
              { href: "/reading", ...t.footer.links[1] },
              { href: "/claim",   ...t.footer.links[2] },
              { href: "/cpen",    ...t.footer.links[3] },
              { href: "/data",    ...t.footer.links[4] },
            ].map((item) => (
              <li key={item.href} className="border-t py-3" style={{ borderColor: "var(--border)" }}>
                <Link
                  href={item.href}
                  className="group flex items-baseline justify-between gap-4"
                  style={{ color: "var(--foreground)" }}
                >
                  <span className="text-sm group-hover:underline">{item.label}</span>
                  <span
                    className="text-[10px] shrink-0"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
                  >
                    {item.desc}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 md:col-start-11">
          <p
            className="text-xs uppercase tracking-[0.18em] mb-5"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
          >
            {t.footer.stack}
          </p>
          <ul className="space-y-0">
            {t.footer.stackItems.map((item) => (
              <li
                key={item.label}
                className="border-t py-3 flex items-baseline justify-between gap-4"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="text-sm" style={{ color: "var(--foreground)" }}>
                  {item.label}
                </span>
                <span
                  className="text-[10px] border px-1.5 py-0.5 shrink-0"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--muted-foreground)",
                    borderColor: "var(--border)",
                  }}
                >
                  {item.tag}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <div
          className="max-w-[1600px] mx-auto px-6 lg:px-10 py-5 flex flex-wrap justify-between gap-3 text-[11px] uppercase tracking-[0.22em]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
        >
          <span>{t.footer.copyright}</span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:underline" style={{ color: "var(--muted-foreground)" }}>
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className="hover:underline" style={{ color: "var(--muted-foreground)" }}>
              {t.footer.terms}
            </Link>
          </span>
          <span>{t.footer.coords}</span>
          <span>{t.footer.license}</span>
        </div>
      </div>
    </footer>
  );
}
