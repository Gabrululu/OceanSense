"use client";

import { useState, useEffect } from "react";

const CACHE_KEY = "usd_pen_rate_v1";
const CACHE_TTL = 60 * 60 * 1000; // 1 hora
const FALLBACK_RATE = 3.44;

interface RateCache {
  rate: number;
  timestamp: number;
}

export function useExchangeRate() {
  const [rate, setRate]             = useState<number>(FALLBACK_RATE);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetching, setFetching]     = useState(false);

  useEffect(() => {
    // Leer caché local primero para evitar flash con fallback
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: RateCache = JSON.parse(raw);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          setRate(cached.rate);
          setLastUpdated(new Date(cached.timestamp));
          return; // caché vigente, no llamar al API
        }
      }
    } catch { /* localStorage no disponible (SSR) */ }

    // Caché vencida o inexistente — obtener tasa en vivo
    setFetching(true);
    fetch("https://api.frankfurter.app/latest?from=USD&to=PEN")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data: { rates?: { PEN?: number } }) => {
        const live = data.rates?.PEN;
        if (typeof live === "number" && live > 0) {
          const now = Date.now();
          setRate(live);
          setLastUpdated(new Date(now));
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: live, timestamp: now } satisfies RateCache));
          } catch { /* cuota llena */ }
        }
      })
      .catch(() => { /* mantener fallback */ })
      .finally(() => setFetching(false));
  }, []);

  return { rate, lastUpdated, fetching };
}
