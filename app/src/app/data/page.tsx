"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOceanSense } from "@/hooks/useOceanSense";
import { Database, ExternalLink, Lock, Play, Radio, Unlock } from "lucide-react";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    audience: "Developers, community, transparency",
    features: [
      "Raw readings via program-derived accounts (Solana RPC)",
      "Full history, no rate limit",
      "No SLA — best effort",
    ],
    cta: "Read the source",
    highlight: false,
  },
  {
    name: "Research",
    price: "$49",
    period: "/ mo",
    audience: "Universities, NGOs, independent researchers",
    features: [
      "Historical CSV export",
      "Aggregated stats API (/api/v1)",
      "Email support",
    ],
    cta: "Subscribe below",
    highlight: true,
  },
  {
    name: "Institutional",
    price: "$499",
    period: "/ mo",
    audience: "PRODUCE, SERNANP, DICAPI, Navy, insurers",
    features: [
      "Real-time pollution-alert webhooks",
      "SLA-backed uptime",
      "Priority integration support",
    ],
    cta: "Subscribe below",
    highlight: false,
  },
];

export default function DataPage() {
  const { connected } = useWallet();
  const { vaultStats, loading, txStatus, lastTxSignature, fundVault } = useOceanSense();

  const [amount, setAmount] = useState("");
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const available = vaultStats ? vaultStats.totalFunded - vaultStats.totalPaid : null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) return;
    await fundVault(numAmount);
    setAmount("");
  };

  const runApiDemo = async () => {
    setApiLoading(true);
    setApiResult(null);
    try {
      const res = await fetch("/api/v1/readings");
      const json = await res.json();
      setApiResult(JSON.stringify(json, null, 2));
    } catch (e: any) {
      setApiResult(`Error: ${e?.message ?? String(e)}`);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto px-6 pt-24 pb-24 space-y-10"
      style={{ background: "var(--background)", minHeight: "100dvh" }}
    >
      {/* Header */}
      <div className="pt-6">
        <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
          / data access
        </p>
        <h1
          className="t-display-sm"
          style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
        >
          Data Access &amp; Institutional Subscriptions
        </h1>
        <p className="mt-2 t-body" style={{ color: "var(--muted-foreground)" }}>
          Raw readings are public and free — the paid layer is aggregation, reliability, and real-time delivery.
        </p>
      </div>

      {/* Free vs paid explainer */}
      <div className="grid grid-cols-2 border" style={{ borderColor: "var(--border)" }}>
        <div className="p-5 border-r" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Unlock size={13} style={{ color: "var(--accent)" }} />
            <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
              Public &amp; free
            </p>
          </div>
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            Every reading lives in a permissionless PDA on Solana Devnet. Anyone can read it directly —
            no API key, no gatekeeper.
          </p>
          <a
            href={`https://explorer.solana.com/address/${process.env.NEXT_PUBLIC_PROGRAM_ID ?? "APbuzcAP5NjhhnqJmEMLX7uEMBRsLHLuZ7rUV9VNsbfx"}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs hover:underline"
            style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
          >
            View program on Explorer <ExternalLink size={11} />
          </a>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={13} style={{ color: "var(--sand)" }} />
            <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
              What's actually paid
            </p>
          </div>
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            You can't paywall a public ledger. What institutions pay for is the layer on top: aggregation,
            historical export, real-time alert delivery, and an SLA.
          </p>
        </div>
      </div>

      {/* Pricing tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className="border p-5 flex flex-col"
            style={{
              borderColor: tier.highlight ? "var(--accent)" : "var(--border)",
              background: tier.highlight ? "var(--surface)" : "transparent",
            }}
          >
            <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
              {tier.name}
            </p>
            <p className="mt-2" style={{ fontFamily: "var(--font-display)", fontWeight: 380 }}>
              <span className="text-3xl" style={{ color: "var(--foreground)" }}>{tier.price}</span>
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{tier.period}</span>
            </p>
            <p className="mt-1 t-mono-xs" style={{ color: "var(--muted-foreground)" }}>
              {tier.audience}
            </p>
            <ul className="mt-4 space-y-2 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="text-xs flex gap-2" style={{ color: "var(--foreground)" }}>
                  <span style={{ color: "var(--accent)" }}>·</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="t-mono-xs -mt-6" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
        Illustrative pricing for the demo — not a researched pricing model yet.
      </p>

      {/* Fund the vault — the real subscription mechanism */}
      <div className="border" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
            Fund the vault — how a subscription actually works
          </p>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            There's no separate billing system — an institutional subscription <em>is</em> a real
            on-chain <code style={{ fontFamily: "var(--font-mono)" }}>fund_vault()</code> call. The USDC
            lands in the same program-owned vault that operators withdraw from via{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>claim_reward</code> — subscription revenue
            and fisher payouts are the same pool, not two separate systems.
          </p>

          {!connected ? (
            <p className="t-mono-xs" style={{ color: "var(--muted-foreground)" }}>
              Connect a wallet to subscribe.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-4 py-2.5 border flex-1"
                style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder:opacity-30"
                  style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
                  required
                />
                <span className="t-eyebrow shrink-0" style={{ color: "var(--muted-foreground)" }}>
                  USDC
                </span>
              </div>
              <button
                type="submit"
                disabled={loading || !numAmount || numAmount <= 0}
                className="px-5 py-2.5 text-xs uppercase tracking-[0.18em] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-mono)", background: "var(--accent)", color: "var(--accent-foreground)" }}
              >
                {loading ? "Processing…" : "Subscribe"}
              </button>
            </form>
          )}

          {txStatus && (
            <div
              className="px-4 py-3 text-sm border flex items-center justify-between"
              style={{
                fontFamily: "var(--font-mono)",
                background: txStatus.startsWith("✅") ? "rgba(94,196,176,0.08)" : txStatus.startsWith("❌") ? "rgba(194,80,58,0.08)" : "var(--surface)",
                borderColor: txStatus.startsWith("✅") ? "var(--accent)" : txStatus.startsWith("❌") ? "var(--alert)" : "var(--border)",
                color: txStatus.startsWith("✅") ? "var(--primary)" : txStatus.startsWith("❌") ? "var(--alert)" : "var(--foreground)",
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
                  View on Explorer <ExternalLink size={11} />
                </a>
              )}
            </div>
          )}

          {/* Vault stats — public, no wallet needed */}
          <div className="grid grid-cols-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="t-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Total funded</p>
              <p className="text-lg" style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>
                {vaultStats ? `${vaultStats.totalFunded.toFixed(2)} USDC` : "—"}
              </p>
            </div>
            <div>
              <p className="t-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Paid to operators</p>
              <p className="text-lg" style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>
                {vaultStats ? `${vaultStats.totalPaid.toFixed(2)} USDC` : "—"}
              </p>
            </div>
            <div>
              <p className="t-eyebrow mb-1" style={{ color: "var(--muted-foreground)" }}>Available</p>
              <p className="text-lg" style={{ fontFamily: "var(--font-mono)", color: "var(--sand)" }}>
                {available !== null ? `${available.toFixed(2)} USDC` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Try the API */}
      <div className="border" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
          <Database size={13} style={{ color: "var(--muted-foreground)" }} />
          <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
            Try the aggregation API
          </p>
        </div>
        <div className="p-5 space-y-3">
          <pre
            className="text-xs px-4 py-3 border overflow-x-auto"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
          >
            curl https://your-domain/api/v1/readings
          </pre>
          <button
            type="button"
            onClick={runApiDemo}
            disabled={apiLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.18em] disabled:opacity-50"
            style={{ fontFamily: "var(--font-mono)", background: "var(--primary)", color: "var(--accent-foreground)" }}
          >
            <Play size={11} />
            {apiLoading ? "Running…" : "Run it"}
          </button>
          {apiResult && (
            <pre
              className="text-xs px-4 py-3 border overflow-x-auto max-h-96 overflow-y-auto"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)", fontFamily: "var(--font-mono)", color: "var(--foreground)" }}
            >
              {apiResult}
            </pre>
          )}
          <p className="t-mono-xs flex items-center gap-1.5" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
            <Radio size={10} />
            Open for the demo — production would gate this behind an API key and meter it per tier.
          </p>
        </div>
      </div>
    </div>
  );
}
