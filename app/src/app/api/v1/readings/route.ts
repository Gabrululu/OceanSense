import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";

// Endpoint de solo lectura — agrega boyas + lecturas on-chain en JSON limpio.
// Es la capa que un producto real gatearía/facturaría (ver /data); acá se
// deja abierta para que la demo se pueda golpear en vivo con curl/fetch.
export const dynamic = "force-dynamic";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || "APbuzcAP5NjhhnqJmEMLX7uEMBRsLHLuZ7rUV9VNsbfx"
);
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

// Wallet de solo lectura — nunca firma nada, solo se necesita para construir
// el Program y leer cuentas públicas (mismo patrón que useOceanSense.ts).
const READONLY_KEYPAIR = Keypair.generate();
const readOnlyWallet = {
  publicKey: READONLY_KEYPAIR.publicKey,
  signTransaction: async () => {
    throw new Error("read-only");
  },
  signAllTransactions: async () => {
    throw new Error("read-only");
  },
};

let idlCache: any = null;
function loadIdl() {
  if (!idlCache) {
    const idlPath = path.join(process.cwd(), "public", "idl", "ocean_sense_pay.json");
    idlCache = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  }
  return idlCache;
}

export async function GET() {
  try {
    const connection = new Connection(RPC_URL, "confirmed");
    const provider = new AnchorProvider(connection, readOnlyWallet as any, { commitment: "confirmed" });
    const program = new Program(loadIdl(), PROGRAM_ID as any, provider as any);

    const [buoyAccounts, readingAccounts] = await Promise.all([
      program.account.buoyState.all(),
      program.account.oceanReading.all(),
    ]);

    const buoysByKey = new Map(
      buoyAccounts.map((b: any) => [b.publicKey.toBase58(), b.account])
    );

    // Solo boyas activas — una boya desactivada puede tener coordenadas
    // erróneas que ya no representan una ubicación real (ver ARCHITECTURE.md).
    const readings = readingAccounts
      .filter((r: any) => buoysByKey.get(r.account.buoy.toBase58())?.isActive)
      .map((r: any) => {
        const buoy = buoysByKey.get(r.account.buoy.toBase58());
        return {
          buoyId:         buoy?.buoyId ?? null,
          location:       buoy?.locationName ?? null,
          latitude:       buoy ? buoy.latitude.toNumber() / 100_000 : null,
          longitude:      buoy ? buoy.longitude.toNumber() / 100_000 : null,
          temperatureC:   r.account.temperature / 100,
          salinityPsu:    r.account.salinity / 100,
          waveHeightM:    r.account.waveHeight / 100,
          pollutionLevel: r.account.pollutionLevel,
          timestamp:      r.account.timestamp.toNumber(),
          usdcReward:     r.account.usdcReward.toNumber() / 1_000_000,
          claimed:        r.account.claimed,
        };
      });

    return NextResponse.json({
      network:   "solana-devnet",
      programId: PROGRAM_ID.toBase58(),
      count:     readings.length,
      readings,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "internal error" }, { status: 500 });
  }
}
