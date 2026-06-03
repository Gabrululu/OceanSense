"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useOceanSense } from "@/hooks/useOceanSense";
import type { BuoyData } from "@/hooks/useOceanSense";
import { useExchangeRate } from "@/hooks/useExchangeRate";
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
  Radio,
  Thermometer,
  CircleDollarSign,
} from "lucide-react";
import clsx from "clsx";
import { Ticker } from "@/components/Ticker";
import { Footer } from "@/components/Footer";

const BuoyMap = dynamic(() => import("@/components/BuoyMap"), { ssr: false });

/* ── Main page ─────────────────────────────────────────────── */
export default function HomePage() {
  const { buoys, cpenStats, loading, fetchBuoys } = useOceanSense();
  const { rate, fetching: rateFetching } = useExchangeRate();

  const activeBuoys   = buoys.filter((b) => b.isActive).length;
  const totalReadings = buoys.reduce((s, b) => s + b.totalReadings, 0);

  return (
    <>
      <HeroSection />
      <Ticker
        items={[
          "Ocean Sense",
          "Peru · Pacific Coast",
          "3,080 km Monitored",
          "Solana Devnet",
          "40K Artisanal Fishers",
          `1 USD = ${rate.toFixed(2)} cPEN`,
          "< $0.001 / tx",
          "DePIN Network",
        ]}
      />
      <NetworkStatsSection
        activeBuoys={activeBuoys}
        totalReadings={totalReadings}
        cpenBalance={cpenStats?.cpenBalance ?? 0}
        loading={loading}
        onRefresh={fetchBuoys}
      />
      <ProblemSection />
      <HowItWorksSection />
      <FisherSection rate={rate} rateFetching={rateFetching} />
      <MapSection buoys={buoys} />
      {buoys.length > 0 && <BuoysTableSection buoys={buoys} />}
      <WhySolanaSection />
      <DataStripSection />
      <Footer />
    </>
  );
}

/* ── Hero ───────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">

      {/* ── Background image + layered overlays ── */}
      <div className="absolute inset-0">
        <img
          src="/hero-ocean.jpg"
          alt="Peruvian Pacific coast with monitoring buoy at dusk"
          className="h-full w-full object-cover object-[center_35%]"
          width={1920}
          height={1280}
        />
        {/* Dark veil — uniform readability across the whole frame */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,20,26,0.62)" }}
        />
        {/* Top fade — merges with navbar */}
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{ background: "linear-gradient(to bottom, rgba(10,20,26,0.9) 0%, transparent 100%)" }}
        />
        {/* Bottom fade — merges cleanly into the next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-56"
          style={{ background: "linear-gradient(to top, #0f1e26 0%, rgba(10,20,26,0.85) 40%, transparent 100%)" }}
        />
        {/* Subtle left vignette — keeps text on left more legible */}
        <div
          className="absolute inset-y-0 left-0 w-2/3"
          style={{ background: "linear-gradient(to right, rgba(10,20,26,0.45) 0%, transparent 100%)" }}
        />
      </div>

      {/* ── Top meta bar ── */}
      <div
        className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-10 w-full pt-24 flex justify-between t-eyebrow"
        style={{ color: "rgba(139,170,173,0.7)" }}
      >
        <span>(01) — Peru · Pacific</span>
        <span className="hidden sm:inline">N°001 / Frontier &apos;26</span>
        <span>Lat —12.04 / Lng —77.04</span>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 mt-auto max-w-[1600px] mx-auto px-6 lg:px-10 pb-20 w-full flex flex-col">

        {/* Headline — a bit above the bottom row */}
        <h1
          className="t-display-2xl mb-16 reveal-up col-span-12 lg:col-span-8"
          style={{ color: "#f0f5f4", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
        >
          An ocean<br />
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
            that pays back.
          </em>
        </h1>

        {/* Bottom row — CTAs left, description right */}
        <div className="grid grid-cols-12 gap-6 items-end">

          {/* Left — CTAs */}
          <div className="col-span-12 lg:col-span-7">
            <div className="flex flex-col items-start gap-3 reveal-up" style={{ animationDelay: "0.15s" }}>
              <Link href="/reading" className="btn-primary">
                Launch App <ArrowRight size={15} />
              </Link>
              <a
                href="#network"
                className="btn-ghost"
                style={{ background: "rgba(15,30,38,0.45)", backdropFilter: "blur(8px)" }}
              >
                Explore Network <ChevronDown size={15} />
              </a>
            </div>
          </div>

          {/* Right — description (lg+) / shown below CTAs on mobile */}
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:flex flex-col justify-end hidden">
            <p
              className="t-body-lg reveal-up"
              style={{
                color: "rgba(220,235,233,0.78)",
                animationDelay: "0.22s",
                textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                lineHeight: "1.65",
              }}
            >
              A DePIN network where artisanal fishers operate IoT buoys and earn{" "}
              <strong style={{ color: "#f0f5f4", fontWeight: 500 }}>cPEN</strong>
              {" "}— a Solana stablecoin pegged to the Peruvian Sol — for every verified ocean reading.
            </p>
          </div>

          {/* Mobile-only description below CTAs */}
          <div className="col-span-12 lg:hidden">
            <p
              className="text-sm leading-relaxed"
              style={{
                color: "rgba(220,235,233,0.72)",
                textShadow: "0 1px 8px rgba(0,0,0,0.4)",
              }}
            >
              A DePIN network where artisanal fishers operate IoT buoys and earn{" "}
              <strong style={{ color: "#f0f5f4", fontWeight: 500 }}>cPEN</strong>
              {" "}for every verified ocean reading.
            </p>
          </div>

        </div>

        {/* Bottom scroll hint */}
        <div
          className="mt-14 flex items-center justify-between t-mono-xs"
          style={{ color: "rgba(139,170,173,0.55)" }}
        >
          <span>Scroll · 01 / 06</span>
          <span className="float-slow" style={{ color: "var(--accent)" }}>◊</span>
          <span>Devnet · live</span>
        </div>
      </div>

    </section>
  );
}

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
    <section
      id="network"
      className="border-y py-20 px-6"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Header row */}
        <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="t-eyebrow mb-2" style={{ color: "var(--muted-foreground)" }}>
              (02) — Live Network
            </p>
            <h2
              className="t-display-xs"
              style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
            >
              Real-time data from Solana Devnet
            </h2>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] border px-4 py-2 transition-colors disabled:opacity-50"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--muted-foreground)",
              borderColor: "var(--border)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <StatCard
            label="Active Buoys"
            value={activeBuoys.toString()}
            sub="on Devnet"
            accent="var(--accent)"
          />
          <StatCard
            label="Total Readings"
            value={totalReadings.toLocaleString()}
            sub="immutable on-chain"
            accent="var(--primary)"
          />
          <StatCard
            label="cPEN Balance"
            value={`S/ ${cpenBalance.toFixed(2)}`}
            sub="in your wallet"
            accent="var(--sand)"
          />
          <StatCard
            label="Coastline"
            value="3,080 km"
            sub="Peru monitored"
            accent="var(--accent)"
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div
      className="border-t pt-6 pb-6 px-4 md:px-0 md:pr-8"
      style={{ borderColor: "var(--border)" }}
    >
      <p className="t-eyebrow mb-4" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </p>
      <p
        className="t-display-sm italic mb-2"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 380,
          color: accent,
        }}
      >
        {value}
      </p>
      <p className="t-mono-xs" style={{ color: "var(--muted-foreground)" }}>
        {sub}
      </p>
    </div>
  );
}

/* ── Problem ────────────────────────────────────────────────── */
function ProblemSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--background)" }}>
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-16">
          <p className="t-eyebrow mb-4" style={{ color: "var(--muted-foreground)" }}>
            (03) — The Problem
          </p>
          <div className="grid grid-cols-12 gap-6">
            <h2
              className="col-span-12 md:col-span-7 t-display-md"
              style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
            >
              Peru&apos;s coast is flying blind
            </h2>
            <p
              className="col-span-12 md:col-span-4 md:col-start-9 t-body self-end"
              style={{ color: "var(--muted-foreground)" }}
            >
              3,080 km of coastline with no real-time ocean data — and 40,000 fishers
              paying the price every season.
            </p>
          </div>
        </div>

        {/* Problem rows */}
        <div>
          {PROBLEMS.map((p, i) => (
            <div
              key={p.stat}
              className="border-t py-8"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Mobile layout: stacked */}
              <div className="flex flex-col gap-3 md:hidden">
                <div className="flex items-baseline gap-4">
                  <span className="t-eyebrow shrink-0" style={{ color: "var(--muted-foreground)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="t-display-xs italic"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--sand)" }}
                  >
                    {p.stat}
                  </span>
                </div>
                <p className="font-medium text-base" style={{ color: "var(--foreground)" }}>
                  {p.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {p.desc}
                </p>
              </div>

              {/* Desktop layout: 12-col grid */}
              <div className="hidden md:grid grid-cols-12 gap-6 items-center">
                <div className="col-span-1 t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  className="col-span-3 t-display-xs italic"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--sand)" }}
                >
                  {p.stat}
                </div>
                <div className="col-span-3">
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>{p.title}</p>
                </div>
                <p className="col-span-5 text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PROBLEMS = [
  {
    stat: "3,080 km",
    title: "No real-time monitoring",
    desc: "Peru's entire coastline has zero decentralized data infrastructure. IMARPE and SENAHMI are centralized, under-resourced, and slow to respond.",
  },
  {
    stat: "$3B lost",
    title: "El Niño 2023–2024",
    desc: "Catastrophic economic losses because no early-warning network existed. Fish populations collapsed overnight with no data to predict the event.",
  },
  {
    stat: "40,000",
    title: "Fishers without data",
    desc: "Artisanal fishers make life-and-death decisions based on experience alone. No temperature alerts, no pollution warnings, no community coordination.",
  },
];

/* ── How it Works ───────────────────────────────────────────── */
function HowItWorksSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-16">
          <p className="t-eyebrow mb-4" style={{ color: "var(--muted-foreground)" }}>
            (04) — How it Works
          </p>
          <h2
            className="t-display-md max-w-xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
          >
            Data to rewards in 3 steps
          </h2>
        </div>

        {/* Steps as rows */}
        <div>
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="border-t py-8 md:py-10"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Mobile layout */}
              <div className="flex gap-4 md:hidden">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <span
                    className="t-display-sm italic"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--accent)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="w-10 h-10 border flex items-center justify-center"
                    style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
                  >
                    {step.icon}
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <p
                    className="text-base font-medium"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:grid grid-cols-12 gap-6 items-center">
                <div
                  className="col-span-1 t-display-sm italic"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--accent)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-1">
                  <div
                    className="w-11 h-11 border flex items-center justify-center"
                    style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
                  >
                    {step.icon}
                  </div>
                </div>
                <div className="col-span-3">
                  <p
                    className="text-lg font-medium"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
                  >
                    {step.title}
                  </p>
                </div>
                <div className="col-span-7">
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: <Radio size={20} style={{ color: "var(--accent)" }} />,
    title: "Deploy a Buoy",
    desc: "Fishers register their IoT buoy on-chain with GPS coordinates. Each buoy gets a Program Derived Address (PDA) on Solana.",
    reward: null,
  },
  {
    icon: <Thermometer size={20} style={{ color: "var(--primary)" }} />,
    title: "Submit Ocean Data",
    desc: "Buoys transmit temperature, salinity, wave height, and pollution level. Every reading is validated and stored immutably on Solana.",
    reward: null,
  },
  {
    icon: <CircleDollarSign size={20} style={{ color: "var(--sand)" }} />,
    title: "Earn cPEN",
    desc: "Every valid reading pays the operator in cPEN — a Solana stablecoin pegged 1:1 to the Peruvian Sol. Critical pollution alerts pay 5× more.",
    reward: "Up to 19.00 S/ per reading",
  },
];

/* ── Map ────────────────────────────────────────────────────── */
function MapSection({ buoys }: { buoys: BuoyData[] }) {
  const active   = buoys.filter((b) => b.isActive).length;
  const inactive = buoys.length - active;

  return (
    <section style={{ background: "var(--background)" }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">

        {/* Section header */}
        <div className="py-12 md:py-20 grid grid-cols-12 gap-6 items-end border-b" style={{ borderColor: "var(--border)" }}>
          <div className="col-span-12 md:col-span-7">
            <p className="t-eyebrow mb-6" style={{ color: "var(--muted-foreground)" }}>
              (05) — Live Map
            </p>
            <h2
              className="t-display-md"
              style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
            >
              Peru&apos;s monitoring<br />
              <em style={{ fontStyle: "italic", color: "var(--accent)" }}>network.</em>
            </h2>
          </div>

          {/* Live counters */}
          <div className="col-span-12 md:col-span-5 grid grid-cols-3 gap-0 border" style={{ borderColor: "var(--border)" }}>
            {[
              { label: "Total buoys",  value: buoys.length.toString(),     color: "var(--foreground)" },
              { label: "Active",       value: active.toString(),            color: "var(--accent)" },
              { label: "Inactive",     value: inactive.toString(),          color: "var(--muted-foreground)" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="p-5 flex flex-col gap-2"
                style={{ borderRight: i < 2 ? `1px solid var(--border)` : undefined }}
              >
                <p className="t-eyebrow" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
                <p
                  className="t-display-sm italic"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: s.color }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Map — full bleed within max-width */}
        <div className="border-x border-b" style={{ borderColor: "var(--border)" }}>

          {/* Toolbar */}
          <div
            className="px-6 py-3 border-b grid grid-cols-3 items-center"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: "var(--accent)" }}
              />
              <span className="t-eyebrow" style={{ color: "var(--foreground)" }}>
                Peruvian Coastline
              </span>
            </div>

            {/* Center */}
            <div className="hidden sm:flex items-center justify-center gap-2 t-mono-xs" style={{ color: "var(--muted-foreground)" }}>
              <MapPin size={11} style={{ color: "var(--accent)" }} />
              {buoys.length > 0
                ? `${buoys.length} buoy${buoys.length !== 1 ? "s" : ""} · click to inspect`
                : "Connect wallet"}
            </div>

            {/* Right */}
            <div className="flex items-center justify-end gap-3 t-mono-xs" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                <span className="hidden sm:inline">Active</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--muted)" }} />
                <span className="hidden sm:inline">Inactive</span>
              </span>
              <span className="hidden md:inline">Solana Devnet</span>
            </div>
          </div>

          {/* Map canvas */}
          <div className="h-[320px] md:h-[580px]">
            <BuoyMap buoys={buoys} />
          </div>

          {/* Footer bar */}
          <div
            className="px-6 py-2.5 flex items-center justify-between border-t t-mono-xs gap-3"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--muted-foreground)" }}
          >
            <span className="truncate">Lat —12.04 / Lng —77.04 · Peru</span>
            <span className="shrink-0" style={{ color: "var(--accent)" }}>◊ Devnet live</span>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ── Buoys Table ────────────────────────────────────────────── */
function BuoysTableSection({ buoys }: { buoys: BuoyData[] }) {
  return (
    <section className="pb-12 px-6" style={{ background: "var(--background)" }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Table header */}
        <div
          className="border-t border-b flex items-center justify-between px-0 py-4 mb-0"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="t-eyebrow"
            style={{ color: "var(--muted-foreground)" }}
          >
            Registered Buoys
          </span>
          <span
            className="t-mono-xs border px-3 py-1"
            style={{
              color: "var(--muted-foreground)",
              borderColor: "var(--border)",
            }}
          >
            {buoys.length} total
          </span>
        </div>

        {/* Scrollable table wrapper for mobile */}
        <div className="overflow-x-auto -mx-6 px-6">
          <div style={{ minWidth: "560px" }}>
            {/* Column headers */}
            <div
              className="grid grid-cols-12 gap-4 py-3 border-b t-mono-xs"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <span className="col-span-2">Buoy ID</span>
              <span className="col-span-4">Location</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2 text-right">Readings</span>
              <span className="col-span-2 text-right">USDC</span>
            </div>

            {/* Rows */}
            {buoys.map((buoy) => (
              <div
                key={buoy.publicKey}
                className="grid grid-cols-12 gap-4 py-4 border-b transition-colors"
                style={{ borderColor: "var(--border)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "var(--surface)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <span
                  className="col-span-2 text-sm"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
                >
                  {buoy.buoyId}
                </span>
                <span
                  className="col-span-4 text-sm"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
                >
                  {buoy.locationName}
                </span>
                <span className="col-span-2">
                  <span
                    className="t-mono-xs border px-2 py-0.5"
                    style={{
                      borderColor: buoy.isActive ? "var(--accent)" : "var(--border)",
                      color: buoy.isActive ? "var(--accent)" : "var(--muted-foreground)",
                    }}
                  >
                    {buoy.isActive ? "Active" : "Off"}
                  </span>
                </span>
                <span
                  className="col-span-2 text-right text-sm"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}
                >
                  {buoy.totalReadings.toLocaleString()}
                </span>
                <span
                  className="col-span-2 text-right text-sm"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: buoy.unclaimedUsdc > 0 ? "var(--sand)" : "var(--muted-foreground)",
                  }}
                >
                  ${buoy.unclaimedUsdc.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Why Solana ─────────────────────────────────────────────── */
function WhySolanaSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-16">
          <p className="t-eyebrow mb-4" style={{ color: "var(--muted-foreground)" }}>
            (06) — Why Solana
          </p>
          <div className="grid grid-cols-12 gap-6">
            <h2
              className="col-span-12 md:col-span-6 t-display-md"
              style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
            >
              Built for the real world
            </h2>
            <p
              className="col-span-12 md:col-span-4 md:col-start-9 t-body self-end"
              style={{ color: "var(--muted-foreground)" }}
            >
              A network where fishers submit readings every hour demands near-zero fees
              and instant finality. Only one blockchain qualifies.
            </p>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l" style={{ borderColor: "var(--border)" }}>
          {WHY_SOLANA.map((item) => (
            <div
              key={item.title}
              className="border-b border-r p-6 md:p-8 flex flex-col gap-6 transition-colors duration-200 group"
              style={{ borderColor: "var(--border)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              {/* Top row: index + icon */}
              <div className="flex items-start justify-between">
                <span
                  className="t-mono-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {String(WHY_SOLANA.findIndex(w => w.title === item.title) + 1).padStart(2, "0")}
                </span>
                <div
                  className="w-9 h-9 border flex items-center justify-center transition-colors duration-200"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  {item.icon}
                </div>
              </div>

              {/* Stat / title */}
              <div>
                <p
                  className="text-xl font-medium leading-snug mb-3 group-hover:underline"
                  style={{ color: "var(--foreground)", textUnderlineOffset: "4px" }}
                >
                  {item.title}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {item.desc}
                </p>
              </div>

              {/* Bottom accent line */}
              <div
                className="mt-auto h-px w-0 group-hover:w-full transition-all duration-500"
                style={{ background: "var(--accent)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Fisher editorial ───────────────────────────────────────── */
function FisherSection({ rate, rateFetching }: { rate: number; rateFetching: boolean }) {
  return (
    <section className="px-6" style={{ background: "var(--background)" }}>
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-0">

        {/* Left: text — aligned to image top */}
        <div className="col-span-12 md:col-span-7 flex flex-col justify-between py-12 md:py-24 md:pr-16 border-b md:border-b-0 md:border-r" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="t-eyebrow mb-8" style={{ color: "var(--muted-foreground)" }}>
              (05) cPEN — Crypto Sol
            </p>
            <h2
              className="t-display-lg text-balance"
              style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
            >
              A stablecoin<br />
              <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
                for the people<br />who feed Lima.
              </em>
            </h2>
          </div>

          {/* Spec table — aligns to bottom of image */}
          <div className="mt-16">
            {[
              ["Standard",      "Token-2022 (SPL)"],
              ["Peg",           "1 cPEN = 1 Peruvian Sol"],
              ["Tasa en vivo",  rateFetching ? "Cargando…" : `1 USD = ${rate.toFixed(2)} cPEN`],
              ["Collateral",    "USDC colateralizado"],
              ["Transfer fee",  "0.5% · cap 10,000 cPEN"],
              ["Metadata",      "Native on-chain · no Metaplex"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-12 gap-4 border-t py-4 items-baseline"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="col-span-4 t-mono-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {k}
                </span>
                <span
                  className="col-span-8 text-base"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: image — full height of section */}
        <div className="col-span-12 md:col-span-5">
          <div className="relative h-full min-h-[300px] md:min-h-[560px] overflow-hidden">
            <img
              src="/fisher.jpg"
              alt="Artisanal fisher silhouette at dawn"
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="lazy"
              width={1400}
              height={1750}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(15,30,38,0.7) 0%, rgba(15,30,38,0.15) 50%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-x-0 bottom-0 p-6 flex justify-between t-mono-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span>Paita · 05.06°S</span>
              <span style={{ color: "var(--accent)" }}>cPEN ◊</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ── Data strip with texture ────────────────────────────────── */
function DataStripSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/texture-water.jpg"
          alt=""
          aria-hidden
          className="h-full w-full object-cover opacity-30"
          loading="lazy"
          width={1600}
          height={1000}
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(15,30,38,0.72)" }}
        />
      </div>
      <div className="relative max-w-[1600px] mx-auto px-6 lg:px-10 py-16 md:py-32 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
        {[
          ["3,080", "km de litoral"],
          ["40k", "pescadores alcanzados"],
          ["$3B", "pérdida El Niño '23"],
          ["< $0.001", "fee por tx en Solana"],
        ].map(([n, l]) => (
          <div
            key={l}
            className="border-t pt-6"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="t-display-md italic"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 380,
                color: "var(--accent)",
              }}
            >
              {n}
            </p>
            <p className="mt-3 t-eyebrow" style={{ color: "var(--muted-foreground)" }}>
              {l}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const WHY_SOLANA = [
  {
    icon: <Zap size={17} style={{ color: "var(--sand)" }} />,
    title: "< $0.001 per transaction",
    desc: "Fishers submit readings every hour. High fees would destroy the economic model. Solana makes it viable at scale.",
  },
  {
    icon: <Activity size={17} style={{ color: "var(--accent)" }} />,
    title: "Sub-second finality",
    desc: "Pollution alerts must reach operators in seconds, not minutes. Solana's speed is non-negotiable for safety-critical data.",
  },
  {
    icon: <Lock size={17} style={{ color: "var(--primary)" }} />,
    title: "Token-2022 native",
    desc: "Transfer Fee + Freeze Authority built in. SBS/UIF compliance and revenue sharing without extra smart contract code.",
  },
  {
    icon: <Database size={17} style={{ color: "var(--accent)" }} />,
    title: "DePIN ecosystem leader",
    desc: "Solana is home to Helium, Hivemapper, and GEODNET. Ocean-Sense follows a proven DePIN playbook on the best DePIN chain.",
  },
  {
    icon: <Globe size={17} style={{ color: "var(--primary)" }} />,
    title: "Composable by design",
    desc: "Any Solana program can read Ocean-Sense PDAs permissionlessly — insurance, lending, weather apps, all without permission.",
  },
  {
    icon: <Shield size={17} style={{ color: "var(--sand)" }} />,
    title: "Immutable audit trail",
    desc: "Every ocean reading lives in a PDA forever. Researchers, regulators, and insurers can verify data without trusting a middleman.",
  },
];
