"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useOceanSense } from "@/hooks/useOceanSense";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Coins, ExternalLink, TrendingUp, RefreshCw } from "lucide-react";

export default function ClaimPage() {
  const { connected } = useWallet();
  const { buoys, loading, txStatus, claimRewardAsCpen } = useOceanSense();
  const { rate, lastUpdated, fetching } = useExchangeRate();

  const myBuoys = buoys.filter((b) => b.unclaimedUsdc > 0);
  const totalPending = myBuoys.reduce((s, b) => s + b.unclaimedUsdc, 0);
  const totalCpen    = totalPending * rate;

  if (!connected) {
    return (
      <div
        className="flex flex-col items-center justify-center px-4 pt-32 pb-24 gap-6 min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <Coins size={40} style={{ color: "var(--muted-foreground)" }} />
        <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
          Conecta tu wallet para ver tus recompensas.
        </p>
      </div>
    );
  }

  return (
    <div
      className="max-w-2xl mx-auto px-6 pt-24 pb-16 space-y-8"
      style={{ background: "var(--background)", minHeight: "100vh" }}
    >
      {/* Page header */}
      <div className="pt-6">
        <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
          /recompensas
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1
            className="t-display-sm"
            style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
          >
            Recompensas
          </h1>
          {fetching ? (
            <RefreshCw size={14} className="animate-spin mb-2" style={{ color: "var(--muted-foreground)" }} />
          ) : (
            <span
              className="mb-2 border px-3 py-1 text-xs uppercase tracking-[0.18em]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                borderColor: "var(--accent)",
              }}
            >
              1 USDC = {rate.toFixed(3)} S/
            </span>
          )}
        </div>
        <p className="mt-2 t-body" style={{ color: "var(--muted-foreground)" }}>
          Cobra tus datos oceánicos en cPEN
        </p>
      </div>

      {/* Summary strip */}
      <div
        className="grid grid-cols-2 border"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="p-6 border-r" style={{ borderColor: "var(--border)" }}>
          <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
            Total pendiente
          </p>
          <p
            className="t-display-xs italic"
            style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--accent)" }}
          >
            ${totalPending.toFixed(4)}
          </p>
          <p className="t-mono-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
            USDC acumulado
          </p>
        </div>
        <div className="p-6">
          <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
            Recibirás en cPEN
          </p>
          <p
            className="t-display-xs italic"
            style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--sand)" }}
          >
            S/ {totalCpen.toFixed(2)}
          </p>
          <p className="t-mono-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
            al tipo 1 USDC = {rate.toFixed(3)} cPEN
            {lastUpdated && (
              <span className="ml-1" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
                · {lastUpdated.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Buoys list */}
      {myBuoys.length === 0 ? (
        <div
          className="border p-16 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <TrendingUp size={32} className="mx-auto mb-4" style={{ color: "var(--muted-foreground)" }} />
          <p className="t-eyebrow mb-2" style={{ color: "var(--muted-foreground)" }}>
            Sin recompensas pendientes
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
            Envía lecturas para acumular USDC.
          </p>
        </div>
      ) : (
        <div>
          {/* Column header */}
          <div
            className="grid grid-cols-12 gap-4 py-3 border-t border-b t-mono-xs"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            <span className="col-span-3">Buoy ID</span>
            <span className="col-span-3">Location</span>
            <span className="col-span-2">Readings</span>
            <span className="col-span-2">Pending</span>
            <span className="col-span-2 text-right">Action</span>
          </div>

          {/* Rows */}
          {myBuoys.map((buoy) => (
            <div
              key={buoy.publicKey}
              className="grid grid-cols-12 gap-4 py-4 border-b items-center"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="col-span-3 text-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
              >
                {buoy.buoyId}
              </span>
              <div className="col-span-3">
                <span className="text-sm block truncate" style={{ color: "var(--foreground)" }}>
                  {buoy.locationName}
                </span>
                <span
                  className="border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] mt-1 inline-block"
                  style={{
                    fontFamily: "var(--font-mono)",
                    borderColor: buoy.isActive ? "var(--accent)" : "var(--border)",
                    color: buoy.isActive ? "var(--accent)" : "var(--muted-foreground)",
                  }}
                >
                  {buoy.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              <span
                className="col-span-2 text-sm"
                style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
              >
                {buoy.totalReadings}
              </span>
              <div className="col-span-2">
                <p
                  className="text-sm"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--sand)" }}
                >
                  ${buoy.unclaimedUsdc.toFixed(4)}
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                  S/ {(buoy.unclaimedUsdc * rate).toFixed(2)}
                </p>
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => claimRewardAsCpen(buoy.buoyId)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--accent)",
                    color: "var(--accent-foreground)",
                  }}
                >
                  <Coins size={12} />
                  Cobrar
                </button>
              </div>
            </div>
          ))}

          {/* Claim all */}
          {myBuoys.length > 1 && (
            <button
              onClick={async () => {
                for (const b of myBuoys) await claimRewardAsCpen(b.buoyId);
              }}
              disabled={loading}
              className="w-full py-3 mt-4 border text-xs uppercase tracking-[0.18em] transition-colors disabled:opacity-50"
              style={{
                fontFamily: "var(--font-mono)",
                borderColor: "var(--sand)",
                color: "var(--sand)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,184,122,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {loading ? "Procesando..." : `Cobrar todo — S/ ${totalCpen.toFixed(2)} cPEN`}
            </button>
          )}
        </div>
      )}

      {/* Status tx */}
      {txStatus && (
        <div
          className="px-4 py-3 text-sm border flex items-center justify-between"
          style={{
            fontFamily: "var(--font-mono)",
            background: txStatus.startsWith("✅")
              ? "rgba(94,196,176,0.08)"
              : txStatus.startsWith("❌")
              ? "rgba(194,80,58,0.08)"
              : "var(--surface)",
            borderColor: txStatus.startsWith("✅")
              ? "var(--accent)"
              : txStatus.startsWith("❌")
              ? "var(--alert)"
              : "var(--border)",
            color: txStatus.startsWith("✅")
              ? "var(--primary)"
              : txStatus.startsWith("❌")
              ? "var(--alert)"
              : "var(--foreground)",
          }}
        >
          <span>{txStatus}</span>
          {txStatus.startsWith("✅") && (
            <a
              href={`https://explorer.solana.com/tx/${txStatus.split("|")[1]?.trim().replace("...", "")}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:underline"
            >
              Ver en Explorer <ExternalLink size={11} />
            </a>
          )}
        </div>
      )}

      {/* cPEN info */}
      <div
        className="border p-5 space-y-2"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <p
          className="t-eyebrow mb-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          ¿Qué es cPEN?
        </p>
        {[
          "Stablecoin pegged 1:1 al Sol Peruano (PEN)",
          "Emitida sobre Solana con Token-2022 (Transfer Fee 0.5%)",
          "Colateralizada con USDC · Redimible en todo momento",
          `1 USDC = ${rate.toFixed(3)} cPEN (tipo de cambio USD/PEN en vivo)`,
        ].map((line, i) => (
          <p
            key={i}
            className="text-xs leading-relaxed"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
          >
            — {line}
          </p>
        ))}
      </div>
    </div>
  );
}
