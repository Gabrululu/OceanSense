"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { min: 0,  label: "Conectando a Solana Devnet…" },
  { min: 20, label: "Cargando red de boyas IoT…"  },
  { min: 45, label: "Inicializando protocolo cPEN…" },
  { min: 68, label: "Sincronizando lecturas on-chain…" },
  { min: 88, label: "Listo." },
];

function getStage(pct: number) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (pct >= STAGES[i].min) return STAGES[i].label;
  }
  return STAGES[0].label;
}

export function Preloader() {
  const [done, setDone]   = useState(false);
  const [pct,  setPct]    = useState(0);
  const [rings, setRings] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("os_loaded")) {
      setDone(true);
      return;
    }

    // Start ring animation after a short delay
    const ringTimer = setTimeout(() => setRings(true), 200);

    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 14 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        setTimeout(() => {
          sessionStorage.setItem("os_loaded", "1");
          setDone(true);
        }, 600);
      }
      setPct(Math.floor(p));
    }, 120);

    return () => {
      clearInterval(id);
      clearTimeout(ringTimer);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col transition-opacity duration-700 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "var(--background)" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-6 lg:px-10 pt-7 text-[10px] uppercase tracking-[0.24em]"
        style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
      >
        <span>Ocean·Sense</span>
        <span className="hidden md:inline">DePIN · Litoral Peruano</span>
        <span>N°001 / Frontier &apos;26</span>
      </div>

      {/* ── Centre — buoy signal animation ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10">

        {/* Pulsing buoy rings */}
        <div className="relative flex items-center justify-center w-40 h-40">
          {/* Outer rings */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute rounded-full border"
              style={{
                width:  `${(i + 1) * 44}px`,
                height: `${(i + 1) * 44}px`,
                borderColor: "var(--accent)",
                opacity: rings ? (0.18 - i * 0.05) : 0,
                transform: rings ? "scale(1)" : "scale(0.6)",
                transition: `opacity 0.8s ease ${i * 0.18}s, transform 0.8s ease ${i * 0.18}s`,
                animation: rings ? `buoyRing ${2.4 + i * 0.6}s ease-in-out ${i * 0.3}s infinite alternate` : "none",
              }}
            />
          ))}

          {/* Core dot */}
          <span
            className="relative z-10 rounded-full"
            style={{
              width: "18px",
              height: "18px",
              background: "var(--accent)",
              boxShadow: "0 0 20px var(--accent), 0 0 40px rgba(94,196,176,0.35)",
              animation: "buoyPulse 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Logo wordmark */}
        <div className="text-center space-y-3">
          <p
            className="text-[clamp(2.2rem,6vw,4rem)] leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 380,
              letterSpacing: "-0.035em",
              color: "var(--foreground)",
            }}
          >
            Ocean<em style={{ fontStyle: "italic", color: "var(--accent)" }}>·Sense</em>
          </p>
          <p
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
          >
            DePIN Ocean Monitoring · Solana
          </p>
        </div>

        {/* Stage label */}
        <p
          className="text-[11px] uppercase tracking-[0.22em] transition-all duration-500"
          style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
        >
          {getStage(pct)}
        </p>
      </div>

      {/* ── Bottom progress ── */}
      <div className="px-6 lg:px-10 pb-8 space-y-3">
        {/* Wave progress bar */}
        <div
          className="relative h-px w-full overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          <div
            className="absolute left-0 top-0 h-full transition-[width] duration-200 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(to right, var(--primary), var(--accent))",
              boxShadow: "0 0 8px var(--accent)",
            }}
          />
        </div>

        {/* Labels */}
        <div
          className="flex justify-between text-[10px] uppercase tracking-[0.24em]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
        >
          <span>Lat —12.04 / Lng —77.04 · Peru · Pacific</span>
          <span style={{ color: pct === 100 ? "var(--accent)" : "var(--muted-foreground)" }}>
            {String(pct).padStart(3, "0")} / 100
          </span>
        </div>
      </div>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes buoyPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(0.88); }
        }
        @keyframes buoyRing {
          from { transform: scale(0.92); opacity: 0.08; }
          to   { transform: scale(1.08); opacity: 0.22; }
        }
      `}</style>
    </div>
  );
}
