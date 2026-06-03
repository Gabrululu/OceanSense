"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOceanSense } from "@/hooks/useOceanSense";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Waves, Send, PlusCircle } from "lucide-react";
import clsx from "clsx";

const POLLUTION_LABELS = [
  { value: 0, label: "Limpio",     active: "var(--primary)",  border: "var(--primary)" },
  { value: 1, label: "Leve",       active: "var(--sand)",     border: "var(--sand)" },
  { value: 2, label: "Moderado",   active: "var(--sand)",     border: "var(--sand)" },
  { value: 3, label: "Crítico 🚨", active: "var(--alert)",    border: "var(--alert)" },
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
      <div
        className="flex flex-col items-center justify-center px-4 pt-32 pb-24 gap-6 min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <Waves size={40} style={{ color: "var(--muted-foreground)" }} />
        <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
          Conecta tu wallet para enviar lecturas.
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
          / boya iot
        </p>
        <h1
          className="t-display-sm"
          style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
        >
          Boya IoT
        </h1>
        <p className="mt-2 t-body" style={{ color: "var(--muted-foreground)" }}>
          Registra una boya o envía datos oceánicos.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex border"
        style={{ borderColor: "var(--border)" }}
      >
        {(["reading", "register"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "var(--accent-foreground)" : "var(--muted-foreground)",
              borderRight: t === "reading" ? `1px solid var(--border)` : undefined,
            }}
          >
            {t === "reading" ? "Enviar lectura" : "Registrar boya"}
          </button>
        ))}
      </div>

      {/* Form: enviar lectura */}
      {tab === "reading" && (
        <form onSubmit={handleReading} className="space-y-6">
          <Panel>
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
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
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
                    className="py-2.5 px-2 text-xs uppercase tracking-[0.12em] transition-all border"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: reading.pollutionLevel === p.value ? "transparent" : "transparent",
                      borderColor: reading.pollutionLevel === p.value ? p.border : "var(--border)",
                      color: reading.pollutionLevel === p.value ? p.active : "var(--muted-foreground)",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Reward preview */}
            <div
              className="flex items-center justify-between px-4 py-3 border text-sm"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
            >
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.18em" }}>
                Recompensa estimada
              </span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--sand)", fontWeight: 500 }}>
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
          </Panel>

          <SubmitButton loading={loading} icon={<Send size={14} />}>
            Enviar lectura
          </SubmitButton>
        </form>
      )}

      {/* Form: registrar boya */}
      {tab === "register" && (
        <form onSubmit={handleRegister} className="space-y-6">
          <Panel>
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
          </Panel>

          <SubmitButton loading={loading} icon={<PlusCircle size={14} />}>
            Registrar boya
          </SubmitButton>
        </form>
      )}

      {/* Status */}
      {txStatus && (
        <div
          className="px-4 py-3 text-sm border"
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
          {txStatus}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border p-6 space-y-5"
      style={{
        border: `1px solid var(--border)`,
        background: "var(--surface)",
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label
        className="block text-xs uppercase tracking-[0.18em]"
        style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
      >
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
      className="w-full flex items-center justify-center gap-2 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: "var(--accent)",
        color: "var(--accent-foreground)",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
      }}
    >
      {icon}
      {loading ? "Procesando..." : children}
    </button>
  );
}
