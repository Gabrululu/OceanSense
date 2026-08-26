"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useOceanSense } from "@/hooks/useOceanSense";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useLanguage } from "@/components/LanguageProvider";
import { Coins, DollarSign, ExternalLink, TrendingUp, RefreshCw } from "lucide-react";

export default function ClaimPage() {
  const { connected } = useWallet();
  const { buoys, vaultStats, loading, txStatus, lastTxSignature, claimRewardAsCpen, claimReward } = useOceanSense();
  const { rate, lastUpdated, fetching } = useExchangeRate();
  const { t, lang } = useLanguage();

  const myBuoys = buoys.filter((b) => b.unclaimedUsdc > 0);
  const totalPending = myBuoys.reduce((s, b) => s + b.unclaimedUsdc, 0);
  const totalCpen    = totalPending * rate;

  if (!connected) {
    return (
      <div
        className="flex flex-col items-center justify-center px-4 pt-32 pb-24 gap-6 min-h-dvh"
        style={{ background: "var(--background)" }}
      >
        <Coins size={40} style={{ color: "var(--muted-foreground)" }} />
        <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
          {t.claim.connectWallet}
        </p>
      </div>
    );
  }

  return (
    <div
      className="max-w-2xl mx-auto px-6 pt-24 pb-16 space-y-8"
      style={{ background: "var(--background)", minHeight: "100dvh" }}
    >
      {/* Page header */}
      <div className="pt-6">
        <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
          {t.claim.eyebrow}
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1
            className="t-display-sm"
            style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
          >
            {t.claim.title}
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
          {t.claim.subtitle}
        </p>
        <p className="mt-1 t-mono-xs" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
          {t.claim.vaultNoteBefore}{" "}
          <a href="/data" className="hover:underline" style={{ color: "var(--sand)" }}>
            /data
          </a>
          {t.claim.vaultNoteAfter} {vaultStats ? `$${(vaultStats.totalFunded - vaultStats.totalPaid).toFixed(2)}` : "—"}
        </p>
      </div>

      {/* Summary strip */}
      <div
        className="grid grid-cols-2 border"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="p-6 border-r" style={{ borderColor: "var(--border)" }}>
          <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
            {t.claim.totalPending}
          </p>
          <p
            className="t-display-xs italic"
            style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--accent)" }}
          >
            ${totalPending.toFixed(4)}
          </p>
          <p className="t-mono-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
            {t.claim.usdcAccrued}
          </p>
        </div>
        <div className="p-6">
          <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
            {t.claim.youWillReceive}
          </p>
          <p
            className="t-display-xs italic"
            style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--sand)" }}
          >
            S/ {totalCpen.toFixed(2)}
          </p>
          <p className="t-mono-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
            {t.claim.atRate} {rate.toFixed(3)} cPEN
            {lastUpdated && (
              <span className="ml-1" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
                · {lastUpdated.toLocaleTimeString(lang === "es" ? "es-PE" : "en-US", { hour: "2-digit", minute: "2-digit" })}
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
            {t.claim.noRewards}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
            {t.claim.noRewardsSub}
          </p>
        </div>
      ) : (
        <div>
          {/* Column header */}
          <div
            className="grid grid-cols-12 gap-4 py-3 border-t border-b t-mono-xs"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            <span className="col-span-3">{t.claim.buoyId}</span>
            <span className="col-span-3">{t.claim.location}</span>
            <span className="col-span-1">{t.claim.readings}</span>
            <span className="col-span-2">{t.claim.pending}</span>
            <span className="col-span-3 text-right">{t.claim.action}</span>
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
                  {buoy.isActive ? t.claim.activeStatus : t.claim.inactiveStatus}
                </span>
              </div>
              <span
                className="col-span-1 text-sm"
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
              <div className="col-span-3 flex justify-end gap-2">
                <button
                  onClick={() => claimReward(buoy.buoyId)}
                  disabled={loading}
                  title={t.claim.claimUsdcTitle}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-[0.15em] transition-colors disabled:opacity-50 border"
                  style={{
                    fontFamily: "var(--font-mono)",
                    borderColor: "var(--sand)",
                    color: "var(--sand)",
                    background: "transparent",
                  }}
                >
                  <DollarSign size={12} />
                  USDC
                </button>
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
                  cPEN
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
              {loading ? t.claim.processing : t.claim.claimAll(totalCpen.toFixed(2))}
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
          {txStatus.startsWith("✅") && lastTxSignature && (
            <a
              href={`https://explorer.solana.com/tx/${lastTxSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:underline"
            >
              {t.claim.viewExplorer} <ExternalLink size={11} />
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
          {t.claim.whatIsCpen}
        </p>
        {[...t.claim.cpenFacts, t.claim.liveRate(rate.toFixed(3))].map((line, i) => (
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
