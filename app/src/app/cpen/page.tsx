"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOceanSense } from "@/hooks/useOceanSense";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { ArrowDownUp, Coins, ExternalLink, Info, RefreshCw } from "lucide-react";
import clsx from "clsx";

export default function CpenPage() {
  const { connected } = useWallet();
  const { cpenStats, loading, txStatus, mintCpen, redeemCpen } = useOceanSense();
  const { rate, lastUpdated, fetching } = useExchangeRate();

  const [mode, setMode]     = useState<"mint" | "redeem">("mint");
  const [amount, setAmount] = useState("");

  const numAmount = parseFloat(amount) || 0;
  const outputAmount =
    mode === "mint"
      ? (numAmount * rate).toFixed(2)
      : (numAmount / rate).toFixed(6);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) return;
    if (mode === "mint") await mintCpen(numAmount);
    else await redeemCpen(numAmount);
    setAmount("");
  };

  if (!connected) {
    return (
      <div
        className="flex flex-col items-center justify-center px-4 pt-32 pb-24 gap-6 min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <Coins size={40} style={{ color: "var(--muted-foreground)" }} />
        <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
          Conecta tu wallet para usar cPEN.
        </p>
      </div>
    );
  }

  return (
    <div
      className="max-w-lg mx-auto px-6 pt-24 pb-16 space-y-8"
      style={{ background: "var(--background)", minHeight: "100vh" }}
    >
      {/* Page header */}
      <div className="pt-6">
        <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
          / token cpen
        </p>
        <h1
          className="t-display-sm"
          style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
        >
          Token cPEN
        </h1>
        <p className="mt-2 t-body" style={{ color: "var(--muted-foreground)" }}>
          Convierte entre USDC y cPEN (Sol Peruano digital)
        </p>
      </div>

      {/* Balances — spec-table style */}
      <div
        className="grid grid-cols-2 border"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="p-5 border-r" style={{ borderColor: "var(--border)" }}>
          <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
            USDC
          </p>
          <p
            className="t-display-xs italic"
            style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--primary)" }}
          >
            {cpenStats ? cpenStats.usdcBalance.toFixed(2) : "—"}
          </p>
          <p className="t-mono-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
            Devnet
          </p>
        </div>
        <div className="p-5">
          <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
            cPEN
          </p>
          <p
            className="t-display-xs italic"
            style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--sand)" }}
          >
            {cpenStats ? cpenStats.cpenBalance.toFixed(2) : "—"}
          </p>
          <p className="t-mono-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
            1 cPEN = 1 S/
          </p>
        </div>
      </div>

      {/* Mode toggle */}
      <div
        className="flex border"
        style={{ borderColor: "var(--border)" }}
      >
        <ModeButton active={mode === "mint"} onClick={() => setMode("mint")}>
          USDC → cPEN
        </ModeButton>
        <ModeButton active={mode === "redeem"} onClick={() => setMode("redeem")} borderLeft>
          cPEN → USDC
        </ModeButton>
      </div>

      {/* Exchange form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="border p-5 space-y-5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          {/* Input */}
          <div className="space-y-2">
            <label
              className="block text-xs uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
            >
              {mode === "mint" ? "Depositas (USDC)" : "Quemas (cPEN)"}
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 border"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
            >
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-xl outline-none placeholder:opacity-30"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 380,
                  color: "var(--foreground)",
                }}
                required
              />
              <span
                className="t-eyebrow shrink-0"
                style={{ color: "var(--muted-foreground)" }}
              >
                {mode === "mint" ? "USDC" : "cPEN"}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <ArrowDownUp size={15} style={{ color: "var(--muted-foreground)" }} />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <label
              className="block text-xs uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
            >
              {mode === "mint" ? "Recibes (cPEN)" : "Recibes (USDC)"}
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 border"
              style={{ borderColor: "var(--border)", background: "transparent" }}
            >
              <span
                className="flex-1 text-xl"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 380,
                  fontStyle: "italic",
                  color: numAmount > 0 ? "var(--sand)" : "var(--muted-foreground)",
                }}
              >
                {numAmount > 0 ? outputAmount : "0.00"}
              </span>
              <span className="t-eyebrow shrink-0" style={{ color: "var(--muted-foreground)" }}>
                {mode === "mint" ? "cPEN" : "USDC"}
              </span>
            </div>
          </div>

          {/* Live rate */}
          <div
            className="flex items-center justify-between text-xs border-t pt-4"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="flex items-center gap-1.5 t-mono-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              Tipo de cambio
              {fetching && <RefreshCw size={9} className="animate-spin" />}
            </span>
            <span className="flex items-center gap-2">
              <span
                className="t-mono-xs"
                style={{ color: "var(--foreground)" }}
              >
                1 USDC = {rate.toFixed(3)} cPEN
              </span>
              <span
                className="border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em]"
                style={{
                  fontFamily: "var(--font-mono)",
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                }}
              >
                en vivo
              </span>
            </span>
          </div>
          {lastUpdated && (
            <p
              className="t-mono-xs text-right -mt-3"
              style={{ color: "var(--muted-foreground)", opacity: 0.6 }}
            >
              USD/PEN · {lastUpdated.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}

          {/* Fee notice */}
          <div
            className="flex items-start gap-2 text-xs px-3 py-2.5 border"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <Info size={11} className="mt-0.5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", fontSize: "11px" }}>
              Las transferencias de cPEN incluyen un fee de 0.5%
              (Token-2022 Transfer Fee) que va al protocolo Ocean-Sense.
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !numAmount || numAmount <= 0}
          className="w-full py-3 text-xs uppercase tracking-[0.18em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            fontFamily: "var(--font-mono)",
            background: mode === "mint" ? "var(--accent)" : "var(--primary)",
            color: "var(--accent-foreground)",
          }}
        >
          {loading
            ? "Procesando..."
            : mode === "mint"
            ? `Obtener ${outputAmount} cPEN`
            : `Recuperar ${outputAmount} USDC`}
        </button>
      </form>

      {/* Status */}
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
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:underline"
            >
              Explorer <ExternalLink size={11} />
            </a>
          )}
        </div>
      )}

      {/* Protocol stats — spec table */}
      {cpenStats && (
        <div
          className="border"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="px-5 py-3 border-b t-eyebrow"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            Stats del protocolo
          </div>
          {[
            { label: "Total minted", value: `S/ ${cpenStats.totalMinted.toFixed(2)}`, highlight: false },
            { label: "Total redeemed", value: `S/ ${cpenStats.totalRedeemed.toFixed(2)}`, highlight: false },
            {
              label: "En circulación",
              value: `S/ ${(cpenStats.totalMinted - cpenStats.totalRedeemed).toFixed(2)}`,
              highlight: true,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center px-5 py-3.5 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="t-mono-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                {row.label}
              </span>
              <span
                className="text-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: row.highlight ? "var(--sand)" : "var(--foreground)",
                  fontWeight: row.highlight ? 500 : 400,
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
  borderLeft,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  borderLeft?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-3 text-xs uppercase tracking-[0.18em] transition-colors"
      style={{
        fontFamily: "var(--font-mono)",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--accent-foreground)" : "var(--muted-foreground)",
        borderLeft: borderLeft ? `1px solid var(--border)` : undefined,
      }}
    >
      {children}
    </button>
  );
}
