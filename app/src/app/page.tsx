"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useOceanSense } from "@/hooks/useOceanSense";
import type { BuoyData } from "@/hooks/useOceanSense";
import {
  Waves,
  Activity,
  Coins,
  MapPin,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Lock,
  Database,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";

const BuoyMap = dynamic(() => import("@/components/BuoyMap"), { ssr: false });

/* ── Main page ─────────────────────────────────────────────── */
export default function HomePage() {
  const { buoys, cpenStats, loading, fetchBuoys } = useOceanSense();

  const activeBuoys   = buoys.filter((b) => b.isActive).length;
  const totalReadings = buoys.reduce((s, b) => s + b.totalReadings, 0);

  return (
    <>
      <HeroSection />
      <NetworkStatsSection
        activeBuoys={activeBuoys}
        totalReadings={totalReadings}
        cpenBalance={cpenStats?.cpenBalance ?? 0}
        loading={loading}
        onRefresh={fetchBuoys}
      />
      <ProblemSection />
      <HowItWorksSection />
      <MapSection buoys={buoys} />
      {buoys.length > 0 && <BuoysTableSection buoys={buoys} />}
      <WhySolanaSection />
      <PageFooter />
    </>
  );
}

/* ── Hero ───────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 50% -5%, rgba(6,182,212,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 35% 28% at 88% 95%, rgba(129,140,248,0.10) 0%, transparent 60%),
            #020617
          `,
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(34,211,238,0.065) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-28 pb-44">
        {/* Hackathon badge */}
        <div
          className="animate-fade-up inline-flex items-center gap-2.5 bg-cyan-500/10 border border-cyan-500/20
                     text-cyan-400 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-glow-pulse" />
          Colosseum Frontier 2026 · Solana Foundation
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up text-5xl sm:text-6xl md:text-[72px] font-extrabold text-slate-50
                     leading-[1.04] tracking-tight mb-6"
          style={{ animationDelay: "0.1s" }}
        >
          Ocean{" "}
          <span className="text-gradient">Intelligence</span>
          <br />
          for Peru&apos;s Coast
        </h1>

        {/* Description */}
        <p
          className="animate-fade-up text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          A DePIN network where artisanal fishers operate IoT buoys and earn{" "}
          <strong className="text-slate-200 font-semibold">cPEN</strong> — a Solana-native
          stablecoin pegged to the Peruvian Sol — for every verified ocean reading.
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          style={{ animationDelay: "0.3s" }}
        >
          <Link href="/reading" className="btn-primary text-base px-8 py-3.5">
            Launch App <ArrowRight size={17} />
          </Link>
          <a href="#network" className="btn-ghost text-base px-8 py-3.5">
            Explore Network <ChevronDown size={17} />
          </a>
        </div>

        {/* Stat badges */}
        <div
          className="animate-fade-up flex flex-wrap items-center justify-center gap-3 text-sm"
          style={{ animationDelay: "0.4s" }}
        >
          {HERO_BADGES.map((badge) => (
            <span
              key={badge.label}
              className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/50
                         text-slate-300 px-4 py-2 rounded-full backdrop-blur-sm"
            >
              <span className="text-base">{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-full" style={{ height: 72 }}>
          <path
            d="M0,45 C200,85 400,5 600,45 C800,85 1000,5 1200,45 C1320,68 1400,20 1440,45 L1440,90 L0,90 Z"
            fill="rgba(10,15,28,0.65)"
          />
          <path
            d="M0,62 C270,20 540,90 810,50 C1080,10 1260,78 1440,62 L1440,90 L0,90 Z"
            fill="#0a0f1c"
          />
        </svg>
      </div>
    </section>
  );
}

const HERO_BADGES = [
  { icon: "🎣", label: "40K Artisanal Fishers" },
  { icon: "🌊", label: "3,080 km Coastline" },
  { icon: "⚡", label: "< $0.001 / tx" },
  { icon: "🔐", label: "Token-2022 Native" },
];

/* ── Network Stats ──────────────────────────────────────────── */
function NetworkStatsSection({
  activeBuoys,
  totalReadings,
  cpenBalance,
  loading,
  onRefresh,
}: {
  activeBuoys: number;
  totalReadings: number;
  cpenBalance: number;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <section id="network" className="bg-[#0a0f1c] border-y border-slate-800/60 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100">Live Network</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time data from Solana Devnet</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200
                       bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60
                       px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LiveStatCard
            icon={<Waves size={19} className="text-cyan-400" />}
            label="Active Buoys"
            value={activeBuoys.toString()}
            sub="on Devnet"
            accentClass="hover:border-cyan-500/25 hover:shadow-[0_0_32px_rgba(34,211,238,0.07)]"
          />
          <LiveStatCard
            icon={<Activity size={19} className="text-emerald-400" />}
            label="Total Readings"
            value={totalReadings.toLocaleString()}
            sub="immutable on-chain"
            accentClass="hover:border-emerald-500/25 hover:shadow-[0_0_32px_rgba(16,185,129,0.07)]"
          />
          <LiveStatCard
            icon={<Coins size={19} className="text-yellow-400" />}
            label="cPEN Balance"
            value={`S/ ${cpenBalance.toFixed(2)}`}
            sub="in your wallet"
            accentClass="hover:border-yellow-500/25 hover:shadow-[0_0_32px_rgba(234,179,8,0.07)]"
          />
          <LiveStatCard
            icon={<MapPin size={19} className="text-violet-400" />}
            label="Coastline"
            value="3,080 km"
            sub="Peru monitored"
            accentClass="hover:border-violet-500/25 hover:shadow-[0_0_32px_rgba(139,92,246,0.07)]"
          />
        </div>
      </div>
    </section>
  );
}

function LiveStatCard({
  icon,
  label,
  value,
  sub,
  accentClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accentClass: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2.5 transition-all duration-300",
        accentClass
      )}
    >
      <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-slate-100 tracking-tight">{value}</p>
      <p className="text-xs text-slate-600">{sub}</p>
    </div>
  );
}

/* ── Problem ────────────────────────────────────────────────── */
function ProblemSection() {
  return (
    <section className="py-24 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="section-label text-red-400 bg-red-500/10 border border-red-500/20">
            The Problem
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 mt-6 mb-4 tracking-tight">
            Peru&apos;s coast is flying blind
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            3,080 km of coastline with no real-time ocean data — and 40,000 fishers
            paying the price every season.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PROBLEMS.map((p) => (
            <div
              key={p.stat}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8
                         hover:border-red-500/20 hover:shadow-[0_0_50px_rgba(239,68,68,0.05)]
                         transition-all duration-300 group"
            >
              <div className="text-5xl mb-6">{p.emoji}</div>
              <div className={clsx("text-4xl font-extrabold mb-3 tracking-tight", p.color)}>
                {p.stat}
              </div>
              <h3 className="text-slate-100 font-bold text-lg mb-3">{p.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PROBLEMS = [
  {
    emoji: "📍",
    stat: "3,080 km",
    color: "text-orange-400",
    title: "No real-time monitoring",
    desc: "Peru's entire coastline has zero decentralized data infrastructure. IMARPE and SENAHMI are centralized, under-resourced, and slow to respond.",
  },
  {
    emoji: "🌡️",
    stat: "$3B lost",
    color: "text-red-400",
    title: "El Niño 2023–2024",
    desc: "Catastrophic economic losses because no early-warning network existed. Fish populations collapsed overnight with no data to predict the event.",
  },
  {
    emoji: "🎣",
    stat: "40,000",
    color: "text-amber-400",
    title: "Fishers without data",
    desc: "Artisanal fishers make life-and-death decisions based on experience alone. No temperature alerts, no pollution warnings, no community coordination.",
  },
];

/* ── How it Works ───────────────────────────────────────────── */
function HowItWorksSection() {
  return (
    <section className="py-24 px-6 bg-[#040b14]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="section-label text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
            How it Works
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 mt-6 mb-4 tracking-tight">
            Data to rewards in 3 steps
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            The protocol turns raw ocean data into verifiable on-chain records and instant crypto rewards.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector */}
          <div className="hidden md:block absolute top-10 left-[calc(33%+24px)] right-[calc(33%+24px)] h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />

          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-cyan-500/5
                           border border-cyan-500/20 flex items-center justify-center mb-6 relative z-10"
                style={{ boxShadow: "0 0 30px rgba(34,211,238,0.08)" }}
              >
                <span className="text-3xl font-black text-cyan-400">{i + 1}</span>
              </div>
              <div className="text-4xl mb-5">{step.emoji}</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              {step.reward && (
                <span
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold
                             text-yellow-400 bg-yellow-500/10 border border-yellow-500/20
                             px-3 py-1.5 rounded-full"
                >
                  {step.reward}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    emoji: "📡",
    title: "Deploy a Buoy",
    desc: "Fishers register their IoT buoy on-chain with GPS coordinates. Each buoy gets a Program Derived Address (PDA) on Solana.",
    reward: null,
  },
  {
    emoji: "🌊",
    title: "Submit Ocean Data",
    desc: "Buoys transmit temperature, salinity, wave height, and pollution level. Every reading is validated and stored immutably on Solana.",
    reward: null,
  },
  {
    emoji: "💰",
    title: "Earn cPEN",
    desc: "Every valid reading pays the operator in cPEN — a Solana stablecoin pegged 1:1 to the Peruvian Sol. Critical pollution alerts pay 5× more.",
    reward: "Up to 19.00 S/ per reading",
  },
];

/* ── Map ────────────────────────────────────────────────────── */
function MapSection({ buoys }: { buoys: BuoyData[] }) {
  return (
    <section className="py-24 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-label text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
            Live Map
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 mt-6 mb-4 tracking-tight">
            Peru&apos;s monitoring network
          </h2>
          <p className="text-slate-400 text-lg">
            {buoys.length > 0
              ? `${buoys.length} buoy${buoys.length !== 1 ? "s" : ""} registered · Click any marker for live data`
              : "Connect your wallet to register the first buoy on the Peruvian coast"}
          </p>
        </div>

        <div
          className="rounded-2xl border border-slate-800/80 overflow-hidden"
          style={{ boxShadow: "0 0 80px rgba(34,211,238,0.05), 0 30px 60px rgba(0,0,0,0.5)" }}
        >
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <MapPin size={14} className="text-cyan-400" />
              <span className="text-sm font-semibold text-slate-200">Peruvian Coastline</span>
              <span className="text-xs text-slate-600">· Solana Devnet</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                Inactive
              </span>
            </div>
          </div>
          <div className="h-[520px]">
            <BuoyMap buoys={buoys} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Buoys Table ────────────────────────────────────────────── */
function BuoysTableSection({ buoys }: { buoys: BuoyData[] }) {
  return (
    <section className="pb-12 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Registered Buoys
            </span>
            <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
              {buoys.length} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5">Buoy ID</th>
                  <th className="text-left px-5 py-3.5">Location</th>
                  <th className="text-left px-5 py-3.5">Status</th>
                  <th className="text-right px-5 py-3.5">Readings</th>
                  <th className="text-right px-5 py-3.5">USDC Pending</th>
                </tr>
              </thead>
              <tbody>
                {buoys.map((buoy) => (
                  <tr
                    key={buoy.publicKey}
                    className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-cyan-400 text-sm font-semibold">
                      {buoy.buoyId}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{buoy.locationName}</td>
                    <td className="px-5 py-4">
                      <span
                        className={clsx(
                          "px-2.5 py-1 rounded-full text-xs font-bold",
                          buoy.isActive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-slate-700/50 text-slate-400"
                        )}
                      >
                        {buoy.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-300 font-medium">
                      {buoy.totalReadings.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={clsx(
                          "font-semibold",
                          buoy.unclaimedUsdc > 0 ? "text-yellow-400" : "text-slate-600"
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
      </div>
    </section>
  );
}

/* ── Why Solana ─────────────────────────────────────────────── */
function WhySolanaSection() {
  return (
    <section className="py-24 px-6 bg-[#040b14]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="section-label text-violet-400 bg-violet-500/10 border border-violet-500/20">
            Why Solana
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 mt-6 mb-4 tracking-tight">
            Built for the real world
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A network where fishers submit readings every hour demands near-zero fees
            and instant finality. Only one blockchain qualifies.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_SOLANA.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-7
                         hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)]
                         transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-5">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-100 text-base mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const WHY_SOLANA = [
  {
    icon: <Zap size={19} className="text-yellow-400" />,
    title: "< $0.001 per transaction",
    desc: "Fishers submit readings every hour. High fees would destroy the economic model. Solana makes it viable at scale.",
  },
  {
    icon: <Activity size={19} className="text-cyan-400" />,
    title: "Sub-second finality",
    desc: "Pollution alerts must reach operators in seconds, not minutes. Solana's speed is non-negotiable for safety-critical data.",
  },
  {
    icon: <Lock size={19} className="text-emerald-400" />,
    title: "Token-2022 native",
    desc: "Transfer Fee + Freeze Authority built-in. SBS/UIF compliance and revenue sharing without writing extra smart contract code.",
  },
  {
    icon: <Database size={19} className="text-violet-400" />,
    title: "DePIN ecosystem leader",
    desc: "Solana is home to Helium, Hivemapper, and GEODNET. Ocean-Sense follows a proven DePIN playbook on the best DePIN chain.",
  },
  {
    icon: <Globe size={19} className="text-blue-400" />,
    title: "Composable by design",
    desc: "Any Solana program can read Ocean-Sense PDAs permissionlessly — insurance protocols, lending, weather apps.",
  },
  {
    icon: <Shield size={19} className="text-orange-400" />,
    title: "Immutable audit trail",
    desc: "Every ocean reading lives in a PDA forever. Researchers, regulators, and insurers can verify data without trusting a middleman.",
  },
];

/* ── Footer ─────────────────────────────────────────────────── */
function PageFooter() {
  return (
    <footer className="py-10 px-6 bg-[#040b14] border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto text-center space-y-1">
        <p className="text-slate-600 text-xs">
          Colosseum × Solana Foundation · 2026
        </p>
        <p className="text-slate-600 text-xs">
          Built with ❤️ for the Peruvian coast and the fishers who deserve reliable ocean data.
        </p>
      </div>
    </footer>
  );
}
