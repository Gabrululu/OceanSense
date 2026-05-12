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

  const [mode, setMode]       = useState<"mint" | "redeem">("mint");
  const [amount, setAmount]   = useState("");

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
      <div className="flex flex-col items-center justify-center px-4 pt-32 pb-24 gap-4">
        <Coins size={48} className="text-slate-600" />
        <p className="text-slate-400">Conecta tu wallet para usar cPEN.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-12 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Token cPEN</h1>
        <p className="text-slate-400 text-sm mt-1">
          Convierte entre USDC y cPEN (Sol Peruano digital)
        </p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4">
        <BalanceCard
          label="USDC"
          value={cpenStats ? cpenStats.usdcBalance.toFixed(2) : "—"}
          sub="Devnet"
          color="text-blue-400"
        />
        <BalanceCard
          label="cPEN"
          value={cpenStats ? cpenStats.cpenBalance.toFixed(2) : "—"}
          sub="1 cPEN = 1 S/"
          color="text-yellow-400"
        />
      </div>

      {/* Toggle mint/redeem */}
      <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 gap-1">
        <ModeButton active={mode === "mint"} onClick={() => setMode("mint")}>
          USDC → cPEN
        </ModeButton>
        <ModeButton active={mode === "redeem"} onClick={() => setMode("redeem")}>
          cPEN → USDC
        </ModeButton>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">

          {/* Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              {mode === "mint" ? "Depositas (USDC)" : "Quemas (cPEN)"}
            </label>
            <div className="flex items-center gap-3 rounded-lg bg-slate-800 px-4 py-3">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-xl font-semibold
                           text-slate-100 outline-none placeholder:text-slate-600"
                required
              />
              <span className="text-slate-400 font-medium text-sm">
                {mode === "mint" ? "USDC" : "cPEN"}
              </span>
            </div>
          </div>

          {/* Flecha conversión */}
          <div className="flex items-center justify-center">
            <ArrowDownUp size={16} className="text-slate-600" />
          </div>

          {/* Output */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              {mode === "mint" ? "Recibes (cPEN)" : "Recibes (USDC)"}
            </label>
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-3
                            border border-slate-700/50">
              <span className={clsx(
                "flex-1 text-xl font-semibold",
                numAmount > 0 ? "text-yellow-400" : "text-slate-600"
              )}>
                {numAmount > 0 ? outputAmount : "0.00"}
              </span>
              <span className="text-slate-400 font-medium text-sm">
                {mode === "mint" ? "cPEN" : "USDC"}
              </span>
            </div>
          </div>

          {/* Tasa en vivo */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              Tipo de cambio
              {fetching && <RefreshCw size={10} className="animate-spin text-slate-600" />}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-300">1 USDC = {rate.toFixed(3)} cPEN</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/15 text-green-400 font-medium">
                en vivo
              </span>
            </span>
          </div>
          {lastUpdated && (
            <p className="text-[10px] text-slate-600 text-right -mt-2">
              USD/PEN · actualizado {lastUpdated.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}

          {/* Fee aviso */}
          <div className="flex items-start gap-2 text-xs text-slate-500
                          bg-slate-800/50 rounded-lg px-3 py-2">
            <Info size={12} className="mt-0.5 shrink-0 text-slate-600" />
            <span>
              Las transferencias de cPEN incluyen un fee de 0.5%
              (Token-2022 Transfer Fee) que va al protocolo Ocean-Sense.
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !numAmount || numAmount <= 0}
          className={clsx(
            "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
            "flex items-center justify-center gap-2",
            mode === "mint"
              ? "bg-yellow-500 hover:bg-yellow-400 text-black"
              : "bg-blue-600 hover:bg-blue-500 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
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
        <div className={clsx(
          "rounded-lg px-4 py-3 text-sm font-mono flex items-center justify-between",
          txStatus.startsWith("✅")
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : txStatus.startsWith("❌")
            ? "bg-red-500/10 text-red-400 border border-red-500/20"
            : "bg-slate-800 text-slate-300"
        )}>
          <span>{txStatus}</span>
          {txStatus.startsWith("✅") && (
            <a
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:underline"
            >
              Explorer <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {/* Stats del protocolo */}
      {cpenStats && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2 text-sm">
          <p className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-3">
            Stats del protocolo
          </p>
          <StatRow label="Total minted" value={`S/ ${cpenStats.totalMinted.toFixed(2)}`} />
          <StatRow label="Total redeemed" value={`S/ ${cpenStats.totalRedeemed.toFixed(2)}`} />
          <StatRow
            label="En circulación"
            value={`S/ ${(cpenStats.totalMinted - cpenStats.totalRedeemed).toFixed(2)}`}
            highlight
          />
        </div>
      )}
    </div>
  );
}

function BalanceCard({
  label, value, sub, color,
}: {
  label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={clsx("text-2xl font-semibold", color)}>{value}</p>
      <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
    </div>
  );
}

function ModeButton({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-cyan-600 text-white"
          : "text-slate-400 hover:text-slate-200"
      )}
    >
      {children}
    </button>
  );
}

function StatRow({
  label, value, highlight,
}: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={clsx("text-xs font-medium", highlight ? "text-yellow-400" : "text-slate-300")}>
        {value}
      </span>
    </div>
  );
}