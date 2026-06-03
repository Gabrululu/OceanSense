"use client";

export function Ticker({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden border-y"
      style={{ borderColor: "var(--border)", background: "rgba(22,33,41,0.4)" }}
    >
      <div
        className="ticker flex w-max gap-12 py-4 text-xs uppercase tracking-[0.25em]"
        style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
      >
        {row.map((it, i) => (
          <span key={i} className="flex items-center gap-12">
            <span style={{ color: "var(--accent)" }}>◊</span>
            <span>{it}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
