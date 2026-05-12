"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useOceanSense } from "@/hooks/useOceanSense";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Coins, Waves, ExternalLink, TrendingUp, RefreshCw } from "lucide-react";
import clsx from "clsx";

export default function ClaimPage() {
  const { connected } = useWallet();
  const { buoys, loading, txStatus, claimRewardAsCpen } = useOceanSense();
  const { rate, lastUpdated, fetching } = useExchangeRate();

  // Solo mostrar boyas del usuario conectado con saldo pendiente
  const myBuoys = buoys.filter((b) => b.unclaimedUsdc > 0);
  const totalPending = myBuoys.reduce((s, b) => s + b.unclaimedUsdc, 0);
  const totalCpen    = totalPending * rate;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center px-4 pt-32 pb-24 gap-4">
        <Coins size={48} className="text-slate-600" />
        <p className="text-slate-400">Conecta tu wallet para ver tus recompensas.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-12 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Recompensas</h1>
        <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
          Cobra tus datos oceánicos en cPEN
          {fetching
            ? <RefreshCw size={12} className="animate-spin text-slate-600" />
            : <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-medium">
                1 USDC = {rate.toFixed(3)} S/
              </span>
          }
        </p>
      </div>

      {/* Resumen total */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Total pendiente
          </p>
          <p className="text-3xl font-semibold text-cyan-400">
            ${totalPending.toFixed(4)}
          </p>
          <p className="text-xs text-slate-500 mt-1">USDC acumulado</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Recibirás en cPEN
          </p>
          <p className="text-3xl font-semibold text-yellow-400">
            S/ {totalCpen.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            al tipo 1 USDC = {rate.toFixed(3)} cPEN
            {lastUpdated && (
              <span className="ml-1 text-slate-600">
                · {lastUpdated.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Boyas con saldo */}
      {myBuoys.length === 0 ? (
        <div className="rounded-xl border border-slate-800 p-10 text-center">
          <TrendingUp size={36} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">Sin recompensas pendientes.</p>
          <p className="text-slate-500 text-sm mt-1">
            Envía lecturas para acumular USDC.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myBuoys.map((buoy) => (
            <div
              key={buoy.publicKey}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4
                         flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-cyan-400 text-sm font-medium">
                    {buoy.buoyId}
                  </span>
                  <span
                    className={clsx(
                      "text-xs px-2 py-0.5 rounded-full",
                      buoy.isActive
                        ? "bg-green-500/15 text-green-400"
                        : "bg-slate-700 text-slate-400"
                    )}
                  >
                    {buoy.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="text-slate-400 text-xs truncate">{buoy.locationName}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-slate-500">
                    {buoy.totalReadings} lecturas
                  </span>
                  <span className="text-yellow-400 font-medium">
                    ${buoy.unclaimedUsdc.toFixed(4)} USDC
                    {" → "}
                    S/ {(buoy.unclaimedUsdc * rate).toFixed(2)} cPEN
                  </span>
                </div>
              </div>

              <button
                onClick={() => claimRewardAsCpen(buoy.buoyId)}
                disabled={loading}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg
                           bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Coins size={14} />
                Cobrar
              </button>
            </div>
          ))}

          {/* Botón claim all */}
          {myBuoys.length > 1 && (
            <button
              onClick={() =>
                myBuoys.forEach((b) => claimRewardAsCpen(b.buoyId))
              }
              disabled={loading}
              className="w-full py-3 rounded-xl border border-yellow-500/40
                         bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20
                         font-medium text-sm transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : `Cobrar todo — S/ ${totalCpen.toFixed(2)} cPEN`}
            </button>
          )}
        </div>
      )}

      {/* Status tx */}
      {txStatus && (
        <div
          className={clsx(
            "rounded-lg px-4 py-3 text-sm font-mono flex items-center justify-between",
            txStatus.startsWith("✅")
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : txStatus.startsWith("❌")
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-slate-800 text-slate-300"
          )}
        >
          <span>{txStatus}</span>
          {txStatus.startsWith("✅") && (
            <a
              href={`https://explorer.solana.com/tx/${txStatus.split("|")[1]?.trim().replace("...", "")}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:underline"
            >
              Ver en Explorer <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {/* Info cPEN */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-500 space-y-1">
        <p className="text-slate-400 font-medium text-sm mb-2">¿Qué es cPEN?</p>
        <p>• Stablecoin pegged 1:1 al Sol Peruano (PEN)</p>
        <p>• Emitida sobre Solana con Token-2022 (Transfer Fee 0.5%)</p>
        <p>• Colateralizada con USDC · Redimible en todo momento</p>
        <p>• 1 USDC = {rate.toFixed(3)} cPEN (tipo de cambio USD/PEN en vivo)</p>
      </div>
    </div>
  );
}