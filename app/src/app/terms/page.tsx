import Link from "next/link";

export const metadata = {
  title: "Terms — Ocean-Sense",
};

export default function TermsPage() {
  return (
    <div
      className="max-w-2xl mx-auto px-6 pt-24 pb-16 space-y-8"
      style={{ background: "var(--background)", minHeight: "100dvh" }}
    >
      <div className="pt-6">
        <p className="t-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
          /terms
        </p>
        <h1
          className="t-display-sm"
          style={{ fontFamily: "var(--font-display)", fontWeight: 380, color: "var(--foreground)" }}
        >
          Terms
        </h1>
        <p className="mt-2 t-body" style={{ color: "var(--muted-foreground)" }}>
          Last updated August 2026 — read this before connecting a wallet.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        <section>
          <h2 className="t-eyebrow mb-2" style={{ color: "var(--accent)" }}>
            Devnet only
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            Ocean-Sense runs entirely on Solana Devnet. cPEN, USDC, and every reward shown in this
            app are test tokens with no real-world monetary value. Nothing here should be treated
            as a financial product, an investment, or a live payment rail for artisanal fishers —
            it&apos;s a working prototype built for a hackathon.
          </p>
        </section>

        <section>
          <h2 className="t-eyebrow mb-2" style={{ color: "var(--accent)" }}>
            No warranty
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            The protocol, this interface, and the Anchor program are provided &quot;as is,&quot;
            without warranty of any kind. We don&apos;t guarantee uptime, the accuracy of
            submitted ocean readings, or that the Devnet program will keep running or keep its
            state. Data can be reset or the program redeployed at any time during development.
          </p>
        </section>

        <section>
          <h2 className="t-eyebrow mb-2" style={{ color: "var(--accent)" }}>
            Your wallet, your responsibility
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            You are responsible for the security of your own wallet and seed phrase. Ocean-Sense
            never asks for your private key and will never initiate a transaction without your
            explicit signature in your wallet.
          </p>
        </section>

        <section>
          <h2 className="t-eyebrow mb-2" style={{ color: "var(--accent)" }}>
            License
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            The source code is MIT-licensed and open for anyone to read, fork, or build on.
          </p>
        </section>
      </div>

      <Link href="/" className="btn-ghost inline-flex mt-4">
        Volver al inicio
      </Link>
    </div>
  );
}
