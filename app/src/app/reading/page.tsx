"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOceanSense } from "@/hooks/useOceanSense";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Waves, Send, PlusCircle, AlertTriangle } from "lucide-react";
import clsx from "clsx";

const POLLUTION_LABELS = [
  { value: 0, label: "Limpio",     color: "text-green-400",  bg: "bg-green-500/10" },
  { value: 1, label: "Leve",       color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { value: 2, label: "Moderado",   color: "text-orange-400", bg: "bg-orange-500/10" },
  { value: 3, label: "Crítico 🚨", color: "text-red-400",    bg: "bg-red-500/10" },
];

export default function ReadingPage() {
  const { connected } = useWallet();
  const { buoys, loading, txStatus, registerBuoy, submitReading } = useOceanSense();
  const { rate } = useExchangeRate();

  const [tab, setTab] = useState<"register" | "reading">("reading");

  // Form: nueva boya
  const [newBuoy, setNewBuoy] = useState({
    buoyId: "", lat: "", lng: "", locationName: "",
  });

  // Form: lectura
  const [reading, setReading] = useState({
    buoyId: buoys[0]?.buoyId || "",
    temperature: "22.5",
    salinity: "35.1",
    waveHeight: "0.85",
    pollutionLevel: 0,
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerBuoy(
      newBuoy.buoyId,
      parseFloat(newBuoy.lat),
      parseFloat(newBuoy.lng),
      newBuoy.locationName
    );
    setNewBuoy({ buoyId: "", lat: "", lng: "", locationName: "" });
  };

  const handleReading = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReading(
      reading.buoyId,
      parseFloat(reading.temperature),
      parseFloat(reading.salinity),
      parseFloat(reading.waveHeight),
      reading.pollutionLevel
    );
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center px-4 pt-32 pb-24 gap-4">
        <Waves size={48} className="text-slate-600" />
        <p className="text-slate-400">Conecta tu wallet para enviar lecturas.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-12 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Boya IoT</h1>
        <p className="text-slate-400 text-sm mt-1">
          Registra una boya o envía datos oceánicos.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 gap-1">
        {(["reading", "register"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
              tab === t
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {t === "reading" ? "Enviar lectura" : "Registrar boya"}
          </button>
        ))}
      </div>

      {/* Form: enviar lectura */}
      {tab === "reading" && (
        <form onSubmit={handleReading} className="space-y-4">
          <Card>
            {/* Seleccionar boya */}
            <Field label="Boya">
              {buoys.length > 0 ? (
                <select
                  className="input-base"
                  value={reading.buoyId}
                  onChange={(e) => setReading({ ...reading, buoyId: e.target.value })}
                  required
                >
                  {buoys.map((b) => (
                    <option key={b.publicKey} value={b.buoyId}>
                      {b.buoyId} — {b.locationName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-slate-500 text-sm">
                  No hay boyas registradas. Crea una primero.
                </p>
              )}
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Temperatura (°C)">
                <input
                  type="number" step="0.1" className="input-base"
                  value={reading.temperature}
                  onChange={(e) => setReading({ ...reading, temperature: e.target.value })}
                  required
                />
              </Field>
              <Field label="Salinidad (PSU)">
                <input
                  type="number" step="0.1" className="input-base"
                  value={reading.salinity}
                  onChange={(e) => setReading({ ...reading, salinity: e.target.value })}
                  required
                />
              </Field>
              <Field label="Oleaje (m)">
                <input
                  type="number" step="0.01" className="input-base"
                  value={reading.waveHeight}
                  onChange={(e) => setReading({ ...reading, waveHeight: e.target.value })}
                  required
                />
              </Field>
            </div>

            <Field label="Nivel de contaminación">
              <div className="grid grid-cols-4 gap-2">
                {POLLUTION_LABELS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setReading({ ...reading, pollutionLevel: p.value })}
                    className={clsx(
                      "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                      reading.pollutionLevel === p.value
                        ? `${p.bg} ${p.color} border-current`
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Preview de recompensa */}
            <div className="rounded-lg bg-slate-800/50 px-4 py-3 text-sm flex items-center justify-between">
              <span className="text-slate-400">Recompensa estimada:</span>
              <span className="font-semibold text-yellow-400">
                {reading.pollutionLevel === 3
                  ? "5.00 USDC"
                  : reading.pollutionLevel === 2
                  ? "2.00 USDC"
                  : "1.00 USDC"}{" "}
                →{" "}
                {(
                  (reading.pollutionLevel === 3 ? 5 : reading.pollutionLevel === 2 ? 2 : 1) * rate
                ).toFixed(2)} cPEN
              </span>
            </div>
          </Card>

          <SubmitButton loading={loading} icon={<Send size={16} />}>
            Enviar lectura
          </SubmitButton>
        </form>
      )}

      {/* Form: registrar boya */}
      {tab === "register" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <Card>
            <Field label="ID de la boya">
              <input
                type="text" className="input-base" placeholder="ej: PAITA-001"
                maxLength={32}
                value={newBuoy.buoyId}
                onChange={(e) => setNewBuoy({ ...newBuoy, buoyId: e.target.value })}
                required
              />
            </Field>
            <Field label="Nombre de la zona">
              <input
                type="text" className="input-base" placeholder="ej: Boya Paita Norte"
                maxLength={64}
                value={newBuoy.locationName}
                onChange={(e) => setNewBuoy({ ...newBuoy, locationName: e.target.value })}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitud (°)">
                <input
                  type="number" step="0.00001" className="input-base"
                  placeholder="-5.0623"
                  value={newBuoy.lat}
                  onChange={(e) => setNewBuoy({ ...newBuoy, lat: e.target.value })}
                  required
                />
              </Field>
              <Field label="Longitud (°)">
                <input
                  type="number" step="0.00001" className="input-base"
                  placeholder="-81.4300"
                  value={newBuoy.lng}
                  onChange={(e) => setNewBuoy({ ...newBuoy, lng: e.target.value })}
                  required
                />
              </Field>
            </div>
          </Card>

          <SubmitButton loading={loading} icon={<PlusCircle size={16} />}>
            Registrar boya
          </SubmitButton>
        </form>
      )}

      {/* Status */}
      {txStatus && (
        <div className={clsx(
          "rounded-lg px-4 py-3 text-sm font-mono",
          txStatus.startsWith("✅")
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : txStatus.startsWith("❌")
            ? "bg-red-500/10 text-red-400 border border-red-500/20"
            : "bg-slate-800 text-slate-300"
        )}>
          {txStatus}
        </div>
      )}
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton({
  loading, icon, children,
}: {
  loading: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                 bg-cyan-600 hover:bg-cyan-500 text-white font-medium
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      {loading ? "Procesando..." : children}
    </button>
  );
}