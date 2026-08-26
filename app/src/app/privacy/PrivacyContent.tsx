"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function PrivacyContent() {
  const { t } = useLanguage();

  return (
    <div
      className="max-w-2xl mx-auto px-6 pt-24 pb-16 space-y-8"
      style={{ background: "var(--background)", minHeight: "100dvh" }}
    >
      <div className="pt-6">
        <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
          {t.privacy.eyebrow}
        </p>
        <h1
          className="t-display-sm"
          style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
        >
          {t.privacy.title}
        </h1>
        <p className="mt-2 t-body" style={{ color: "var(--muted-foreground)" }}>
          {t.privacy.lastUpdated}
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        {t.privacy.sections.map((section) => (
          <section key={section.title}>
            <h2 className="t-eyebrow mb-2" style={{ color: "var(--accent)" }}>
              {section.title}
            </h2>
            <p style={{ color: "var(--muted-foreground)" }}>{section.body}</p>
          </section>
        ))}
      </div>

      <Link href="/" className="btn-ghost inline-flex mt-4">
        {t.privacy.backHome}
      </Link>
    </div>
  );
}
