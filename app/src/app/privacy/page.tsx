import Link from "next/link";

export const metadata = {
  title: "Privacy — Ocean-Sense",
};

export default function PrivacyPage() {
  return (
    <div
      className="max-w-2xl mx-auto px-6 pt-24 pb-16 space-y-8"
      style={{ background: "var(--background)", minHeight: "100dvh" }}
    >
      <div className="pt-6">
        <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
          /privacy
        </p>
        <h1
          className="t-display-sm"
          style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
        >
          Privacy
        </h1>
        <p className="mt-2 t-body" style={{ color: "var(--muted-foreground)" }}>
          Last updated August 2026 — Ocean-Sense is a hackathon prototype running on Solana Devnet.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        <section>
          <h2 className="t-eyebrow mb-2" style={{ color: "var(--accent)" }}>
            What we collect
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            Ocean-Sense does not run its own backend or database. Connecting a wallet (Phantom,
            Solflare, Backpack, or Coinbase) shares your public wallet address with the app so it
            can read your buoys, readings, and cPEN balance directly from Solana Devnet. We never
            see or store your private keys, seed phrase, email, or any off-chain personal
            information.
          </p>
        </section>

        <section>
          <h2 className="t-eyebrow mb-2" style={{ color: "var(--accent)" }}>
            On-chain data
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            Buoy registrations and ocean readings (temperature, salinity, wave height, pollution
            level, coordinates) you submit are written to the Solana Devnet ledger. Like any
            blockchain transaction, this data is public and permanent by design — it is not
            covered by this policy because it isn&apos;t collected by us, it&apos;s published by
            you, directly to the chain.
          </p>
        </section>

        <section>
          <h2 className="t-eyebrow mb-2" style={{ color: "var(--accent)" }}>
            Analytics and cookies
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            No analytics, tracking pixels, or advertising cookies. The app uses{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>localStorage</code> only to cache a
            USD/PEN exchange rate for up to one hour, to avoid refetching it on every page load.
          </p>
        </section>

        <section>
          <h2 className="t-eyebrow mb-2" style={{ color: "var(--accent)" }}>
            Third parties
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            The app calls the Solana Devnet RPC, a public exchange-rate API for USD/PEN, and
            CARTO/OpenStreetMap for map tiles. Each of those requests happens directly from your
            browser and follows that provider&apos;s own policy.
          </p>
        </section>
      </div>

      <Link href="/" className="btn-ghost inline-flex mt-4">
        Volver al inicio
      </Link>
    </div>
  );
}
