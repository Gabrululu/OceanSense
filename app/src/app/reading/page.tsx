"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOceanSense } from "@/hooks/useOceanSense";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useLanguage } from "@/components/LanguageProvider";
import { Waves, Send, PlusCircle, ExternalLink } from "lucide-react";

const POLLUTION_COLORS = [
  { active: "var(--primary)", border: "var(--primary)" },
  { active: "var(--sand)",    border: "var(--sand)" },
  { active: "var(--sand)",    border: "var(--sand)" },
  { active: "var(--alert)",   border: "var(--alert)" },
];

export default function ReadingPage() {
  const { connected, publicKey } = useWallet();
  const { buoys, loading, txStatus, lastTxSignature, registerBuoy, submitReading } = useOceanSense();
  const { rate } = useExchangeRate();
  const { t } = useLanguage();

  // Solo se puede enviar una lectura para una boya que TÚ registraste — el
  // programa exige que buoy.owner == operator.key(). `buoys` trae todas las
  // boyas públicas (para el mapa/dashboard), así que acá se filtra a las
  // propias; de lo contrario el PDA calculado con tu wallet nunca existió
  // on-chain y falla con "Account does not exist or has no data".
  const myBuoys = useMemo(
    () => (publicKey ? buoys.filter((b) => b.owner === publicKey.toBase58()) : []),
    [buoys, publicKey]
  );

  const [tab, setTab] = useState<"register" | "reading">("reading");

  // Form: nueva boya
  const [newBuoy, setNewBuoy] = useState({
    buoyId: "", lat: "", lng: "", locationName: "",
  });

  // Form: lectura
  const [reading, setReading] = useState({
    buoyId: myBuoys[0]?.buoyId || "",
    temperature: "22.5",
    salinity: "35.1",
    waveHeight: "0.85",
    pollutionLevel: 0,
  });

  // `myBuoys` llega async (fetch on-chain) — una vez cargado, precarga la
  // primera boya propia si el formulario todavía no tiene una seleccionada.
  useEffect(() => {
    if (!reading.buoyId && myBuoys.length > 0) {
      setReading((r) => ({ ...r, buoyId: myBuoys[0].buoyId }));
    }
  }, [myBuoys, reading.buoyId]);

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
        className="flex flex-col items-center justify-center px-4 pt-32 pb-24 gap-6 min-h-dvh"
        style={{ background: "var(--background)" }}
      >
        <Waves size={40} style={{ color: "var(--muted-foreground)" }} />
        <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
          {t.reading.connectWallet}
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
          {t.reading.eyebrow}
        </p>
        <h1
          className="t-display-sm"
          style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
        >
          {t.reading.title}
        </h1>
        <p className="mt-2 t-body" style={{ color: "var(--muted-foreground)" }}>
          {t.reading.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex border"
        style={{ borderColor: "var(--border)" }}
      >
        {(["reading", "register"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className="flex-1 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              background: tab === tabKey ? "var(--accent)" : "transparent",
              color: tab === tabKey ? "var(--accent-foreground)" : "var(--muted-foreground)",
              borderRight: tabKey === "reading" ? `1px solid var(--border)` : undefined,
            }}
          >
            {tabKey === "reading" ? t.reading.tabReading : t.reading.tabRegister}
          </button>
        ))}
      </div>

      {/* Form: enviar lectura */}
      {tab === "reading" && (
        <form onSubmit={handleReading} className="space-y-6">
          <Panel>
            <Field label={t.reading.buoyLabel}>
              {myBuoys.length > 0 ? (
                <select
                  className="input-base"
                  value={reading.buoyId}
                  onChange={(e) => setReading({ ...reading, buoyId: e.target.value })}
                  required
                >
                  {myBuoys.map((b) => (
                    <option key={b.publicKey} value={b.buoyId}>
                      {b.buoyId} — {b.locationName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {t.reading.noOwnBuoys}
                </p>
              )}
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label={t.reading.temperature}>
                <input
                  type="number" step="0.1" className="input-base"
                  value={reading.temperature}
                  onChange={(e) => setReading({ ...reading, temperature: e.target.value })}
                  required
                />
              </Field>
              <Field label={t.reading.salinity}>
                <input
                  type="number" step="0.1" className="input-base"
                  value={reading.salinity}
                  onChange={(e) => setReading({ ...reading, salinity: e.target.value })}
                  required
                />
              </Field>
              <Field label={t.reading.waveHeight}>
                <input
                  type="number" step="0.01" className="input-base"
                  value={reading.waveHeight}
                  onChange={(e) => setReading({ ...reading, waveHeight: e.target.value })}
                  required
                />
              </Field>
            </div>

            <Field label={t.reading.pollutionLevel}>
              <div className="grid grid-cols-4 gap-2">
                {t.reading.pollutionLabels.map((label, value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReading({ ...reading, pollutionLevel: value })}
                    className="py-2.5 px-2 text-xs uppercase tracking-[0.12em] transition-all border"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "transparent",
                      borderColor: reading.pollutionLevel === value ? POLLUTION_COLORS[value].border : "var(--border)",
                      color: reading.pollutionLevel === value ? POLLUTION_COLORS[value].active : "var(--muted-foreground)",
                    }}
                  >
                    {label}
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
                {t.reading.estimatedReward}
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

          <SubmitButton loading={loading} icon={<Send size={14} />} label={t.reading.submitReading} processingLabel={t.reading.processing} />
        </form>
      )}

      {/* Form: registrar boya */}
      {tab === "register" && (
        <form onSubmit={handleRegister} className="space-y-6">
          <Panel>
            <Field label={t.reading.buoyIdLabel}>
              <input
                type="text" className="input-base" placeholder={t.reading.buoyIdPlaceholder}
                maxLength={32}
                value={newBuoy.buoyId}
                onChange={(e) => setNewBuoy({ ...newBuoy, buoyId: e.target.value })}
                required
              />
            </Field>
            <Field label={t.reading.zoneName}>
              <input
                type="text" className="input-base" placeholder={t.reading.zoneNamePlaceholder}
                maxLength={64}
                value={newBuoy.locationName}
                onChange={(e) => setNewBuoy({ ...newBuoy, locationName: e.target.value })}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t.reading.latitude}>
                <input
                  type="number" step="0.00001" className="input-base"
                  placeholder="-5.0623"
                  value={newBuoy.lat}
                  onChange={(e) => setNewBuoy({ ...newBuoy, lat: e.target.value })}
                  required
                />
              </Field>
              <Field label={t.reading.longitude}>
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

          <SubmitButton loading={loading} icon={<PlusCircle size={14} />} label={t.reading.registerBuoy} processingLabel={t.reading.processing} />
        </form>
      )}

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
          {txStatus.startsWith("✅") && lastTxSignature && (
            <a
              href={`https://explorer.solana.com/tx/${lastTxSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:underline"
            >
              {t.reading.viewExplorer} <ExternalLink size={11} />
            </a>
          )}
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
  loading, icon, label, processingLabel,
}: {
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  processingLabel: string;
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
      {loading ? processingLabel : label}
    </button>
  );
}
