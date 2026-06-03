import Link from "next/link";

export function Footer() {
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
            Built for the<br />Peruvian coast.
          </p>
          <p className="mt-6 max-w-md text-sm" style={{ color: "var(--muted-foreground)" }}>
            A public-good protocol for 40,000 artisanal fishers along 3,080 km of coastline.            
          </p>
        </div>

        <div className="md:col-span-3 md:col-start-7">
          <p
            className="text-xs uppercase tracking-[0.18em] mb-5"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
          >
            Protocol
          </p>
          <ul className="space-y-0">
            {[
              { href: "/",        label: "Buoy registry",  desc: "register_buoy()" },
              { href: "/reading", label: "Ocean readings",  desc: "submit_reading()" },
              { href: "/claim",   label: "Claim rewards",   desc: "claim_reward_as_cpen()" },
              { href: "/cpen",    label: "cPEN mint",       desc: "mint_cpen()" },
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
            Stack
          </p>
          <ul className="space-y-0">
            {[
              { label: "Solana Devnet",  tag: "chain" },
              { label: "Anchor 0.30.1", tag: "program" },
              { label: "Token-2022",    tag: "standard" },
              { label: "Next.js 14",    tag: "frontend" },
            ].map((item) => (
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
          <span>© 2026 Ocean-Sense Labs</span>
          <span>—12.0464° S / —77.0428° W</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
