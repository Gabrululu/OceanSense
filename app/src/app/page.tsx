"use client";

import dynamic from "next/dynamic";
import { useOceanSense } from "@/hooks/useOceanSense";
import { useWallet } from "@solana/wallet-adapter-react";
import { AlertTriangle, Waves, Activity, Coins, MapPin } from "lucide-react";
import clsx from "clsx";

// Leaflet no funciona en SSR — carga dinámica
const BuoyMap = dynamic(() => import("@/components/BuoyMap"), { ssr: false });

export default function DashboardPage() {
  const { connected } = useWallet();
  const { buoys, cpenStats, loading, fetchBuoys } = useOceanSense();

  const activeBuoys      = buoys.filter((b) => b.isActive).length;
  const totalReadings    = buoys.reduce((s, b) => s + b.totalReadings, 0);
  const totalUnclaimed   = buoys.reduce((s, b) => s + b.unclaimedUsdc, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Red de Monitoreo Oceánico
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Litoral Peruano · Solana Devnet
          </p>
        </div>
        <button
          onClick={fetchBuoys}
          disabled={loading}
          className="text-sm px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700
                     text-slate-300 transition-colors disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Waves size={18} className="text-cyan-400" />}
          label="Boyas activas"
          value={activeBuoys.toString()}
          sub={`de ${buoys.length} total`}
        />
        <StatCard
          icon={<Activity size={18} className="text-green-400" />}
          label="Lecturas totales"
          value={totalReadings.toLocaleString()}
          sub="en Devnet"
        />
        <StatCard
          icon={<Coins size={18} className="text-yellow-400" />}
          label="USDC por cobrar"
          value={`$${totalUnclaimed.toFixed(2)}`}
          sub="pendiente claim"
        />
        <StatCard
          icon={<MapPin size={18} className="text-purple-400" />}
          label="cPEN en wallet"
          value={cpenStats ? `S/ ${cpenStats.cpenBalance.toFixed(2)}` : "—"}
          sub="balance actual"
        />
      </div>

      {/* Mapa */}
      <div className="rounded-xl border border-slate-800 overflow-hidden shadow-2xl shadow-black/40">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">Litoral Peruano</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              Activa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500" />
              Inactiva
            </span>
          </div>
        </div>
        <div className="h-[520px]">
          <BuoyMap buoys={buoys} />
        </div>
      </div>

      {/* Tabla de boyas */}
      {buoys.length > 0 ? (
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <span className="text-sm font-medium">Boyas registradas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Ubicación</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-right px-4 py-3">Lecturas</th>
                  <th className="text-right px-4 py-3">USDC pendiente</th>
                </tr>
              </thead>
              <tbody>
                {buoys.map((buoy) => (
                  <tr
                    key={buoy.publicKey}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-cyan-400">
                      {buoy.buoyId}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {buoy.locationName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          buoy.isActive
                            ? "bg-green-500/15 text-green-400"
                            : "bg-slate-700 text-slate-400"
                        )}
                      >
                        {buoy.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {buoy.totalReadings.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={clsx(
                          buoy.unclaimedUsdc > 0
                            ? "text-yellow-400 font-medium"
                            : "text-slate-500"
                        )}
                      >
                        ${buoy.unclaimedUsdc.toFixed(4)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 p-12 text-center">
          <Waves size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">No hay boyas registradas aún.</p>
          {!connected && (
            <p className="text-slate-500 text-sm mt-1">
              Conecta tu wallet para comenzar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-1">
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-xl font-semibold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}