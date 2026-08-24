"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

// ── Constantes ───────────────────────────────────────────
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "APbuzcAP5NjhhnqJmEMLX7uEMBRsLHLuZ7rUV9VNsbfx"
);
const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
const CPEN_MINT_ADDRESS = process.env.NEXT_PUBLIC_CPEN_MINT || "";

// Wallet de solo lectura: permite construir el Program (y por tanto leer
// cuentas públicas, como la lista de boyas) para visitantes sin wallet
// conectada. Nunca firma nada — signTransaction/signAllTransactions solo
// se invocan desde las acciones de escritura, que ya exigen wallet.publicKey
// real antes de llamarse, así que esta wallet jamás llega a intentarlo.
const READONLY_KEYPAIR = Keypair.generate();
const readOnlyWallet = {
  publicKey: READONLY_KEYPAIR.publicKey,
  signTransaction: async () => {
    throw new Error("Conecta tu wallet para firmar transacciones.");
  },
  signAllTransactions: async () => {
    throw new Error("Conecta tu wallet para firmar transacciones.");
  },
};

// ── Tipos ─────────────────────────────────────────────────
export interface BuoyData {
  publicKey: string;
  buoyId: string;
  owner: string;
  latitude: number;   // ya convertido a grados (dividido entre 100000)
  longitude: number;
  locationName: string;
  isActive: boolean;
  totalReadings: number;
  totalRewards: number;
  unclaimedUsdc: number;
  lastReadingTimestamp: number;
}

export interface ReadingData {
  publicKey: string;
  buoy: string;
  temperature: number;   // ya en grados (dividido entre 100)
  salinity: number;      // ya en PSU (dividido entre 100)
  waveHeight: number;    // ya en metros (dividido entre 100)
  pollutionLevel: number;
  timestamp: number;
  usdcReward: number;
  claimed: boolean;
}

export interface CpenStats {
  totalMinted: number;
  totalRedeemed: number;
  usdcBalance: number;
  cpenBalance: number;
}

export interface VaultStats {
  totalFunded: number; // USDC depositado históricamente (suscripciones institucionales)
  totalPaid: number;   // USDC ya retirado por operadores
}

// ── Errores legibles ──────────────────────────────────────
function friendlyError(e: any): string {
  const raw: string = e?.error?.errorMessage || e?.message || String(e);

  if (/user rejected|rejected the request|user denied/i.test(raw)) {
    return "Cancelaste la transacción en tu wallet.";
  }
  if (/insufficient lamports|insufficient funds/i.test(raw)) {
    return "Saldo insuficiente para cubrir la comisión de red.";
  }
  if (/blockhash not found|block height exceeded|expired/i.test(raw)) {
    return "La transacción expiró. Intenta de nuevo.";
  }
  if (/InsufficientVaultFunds/i.test(raw)) {
    return "El vault de USDC no tiene fondos suficientes todavía — vuelve a intentar cuando haya más suscripciones institucionales, o cóbralo en cPEN.";
  }
  if (/failed to fetch|network ?error|timeout/i.test(raw)) {
    return "Error de red. Revisa tu conexión e intenta de nuevo.";
  }
  if (/wallet not connected|no wallet/i.test(raw)) {
    return "Conecta tu wallet para continuar.";
  }
  // Los errores de Anchor/RPC pueden venir como bloques enormes — recortarlos
  return raw.length > 140 ? raw.slice(0, 140) + "…" : raw;
}

// ── Hook principal ────────────────────────────────────────
export function useOceanSense() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [program, setProgram] = useState<Program | null>(null);
  const [buoys, setBuoys] = useState<BuoyData[]>([]);
  const [cpenStats, setCpenStats] = useState<CpenStats | null>(null);
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [lastTxSignature, setLastTxSignature] = useState<string | null>(null);

  // ── Inicializar programa Anchor ───────────────────────
  // Con wallet conectada, el Program firma transacciones con ella. Sin
  // wallet, usa una wallet de solo lectura — así el dashboard público
  // (boyas activas, lecturas totales, mapa) carga datos reales para
  // cualquier visitante, no solo para quien conectó una wallet.
  const canSign = !!(wallet.publicKey && wallet.signTransaction);

  useEffect(() => {
    const activeWallet = canSign ? (wallet as any) : readOnlyWallet;
    const provider = new AnchorProvider(
      connection,
      activeWallet,
      { commitment: "confirmed" }
    );

    // IDL se importa desde target/idl después del anchor build
    // Por ahora usamos fetch para cargarlo dinámicamente
    fetch("/idl/ocean_sense_pay.json")
      .then((r) => r.json() as any)
      .then((idl) => {
        const prog = new Program(idl as any, PROGRAM_ID as any, provider as any);
        setProgram(prog);
      })
      .catch(() => {
        console.warn("IDL no encontrado — ejecuta anchor build primero");
      });
  }, [canSign, wallet.publicKey, connection]);

  // ── PDAs helpers ──────────────────────────────────────
  const getBuoyPda = useCallback(
    (buoyId: string, owner: PublicKey) =>
      PublicKey.findProgramAddressSync(
        [Buffer.from("buoy"), Buffer.from(buoyId), owner.toBuffer()],
        PROGRAM_ID
      ),
    []
  );

  const getMintConfigPda = useCallback(
    () =>
      PublicKey.findProgramAddressSync(
        [Buffer.from("mint_config"), USDC_MINT.toBuffer()],
        PROGRAM_ID
      ),
    []
  );

  const getVaultStatePda = useCallback(
    () =>
      PublicKey.findProgramAddressSync(
        [Buffer.from("vault_state"), USDC_MINT.toBuffer()],
        PROGRAM_ID
      ),
    []
  );

  const getVaultTokenPda = useCallback(
    () =>
      PublicKey.findProgramAddressSync(
        [Buffer.from("vault_token"), USDC_MINT.toBuffer()],
        PROGRAM_ID
      ),
    []
  );

  // ── Cargar todas las boyas ────────────────────────────
  const fetchBuoys = useCallback(async () => {
    if (!program) return;
    try {
      const accounts = await program.account.buoyState.all();
      const parsed: BuoyData[] = accounts.map((a: any) => ({
        publicKey:            a.publicKey.toBase58(),
        buoyId:               a.account.buoyId,
        owner:                a.account.owner.toBase58(),
        latitude:             a.account.latitude.toNumber() / 100_000,
        longitude:            a.account.longitude.toNumber() / 100_000,
        locationName:         a.account.locationName,
        isActive:             a.account.isActive,
        totalReadings:        a.account.totalReadings.toNumber(),
        totalRewards:         a.account.totalRewards.toNumber() / 1_000_000,
        unclaimedUsdc:        a.account.unclaimedUsdc.toNumber() / 1_000_000,
        lastReadingTimestamp: a.account.lastReadingTimestamp.toNumber(),
      }));
      setBuoys(parsed);
    } catch (e) {
      console.error("fetchBuoys:", e);
    }
  }, [program]);

  // ── Cargar balances cPEN/USDC del usuario ─────────────
  const fetchCpenStats = useCallback(async () => {
    if (!program || !wallet.publicKey || !CPEN_MINT_ADDRESS) return;
    try {
      const cpenMint = new PublicKey(CPEN_MINT_ADDRESS);

      const usdcAta = await getAssociatedTokenAddress(
        USDC_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID
      );
      const cpenAta = await getAssociatedTokenAddress(
        cpenMint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID
      );

      const [mintConfig] = getMintConfigPda();
      const cfg = await program.account.cpenMintConfig.fetch(mintConfig).catch(() => null) as any;

      let usdcBal = 0;
      let cpenBal = 0;

      try {
        const ua = await getAccount(connection, usdcAta);
        usdcBal = Number(ua.amount) / 1_000_000;
      } catch {}

      try {
        const ca = await getAccount(connection, cpenAta, "confirmed", TOKEN_2022_PROGRAM_ID);
        cpenBal = Number(ca.amount) / 100;
      } catch {}

      setCpenStats({
        totalMinted:   cfg ? cfg.totalMinted.toNumber() / 100 : 0,
        totalRedeemed: cfg ? cfg.totalRedeemed.toNumber() / 100 : 0,
        usdcBalance:   usdcBal,
        cpenBalance:   cpenBal,
      });
    } catch (e) {
      console.error("fetchCpenStats:", e);
    }
  }, [program, wallet.publicKey, connection, getMintConfigPda]);

  // ── Cargar stats del vault de USDC (público, sin wallet) ──
  // El vault se financia vía suscripciones institucionales (fundVault) y
  // es la misma fuente de la que los operadores cobran (claimReward).
  const fetchVaultStats = useCallback(async () => {
    if (!program) return;
    try {
      const [vaultStatePda] = getVaultStatePda();
      const vs = await program.account.vaultState.fetch(vaultStatePda).catch(() => null) as any;
      if (!vs) return;
      setVaultStats({
        totalFunded: vs.totalFunded.toNumber() / 1_000_000,
        totalPaid:   vs.totalPaid.toNumber() / 1_000_000,
      });
    } catch (e) {
      console.error("fetchVaultStats:", e);
    }
  }, [program, getVaultStatePda]);

  useEffect(() => {
    if (program) {
      fetchBuoys();
      fetchCpenStats();
      fetchVaultStats();
    }
  }, [program, fetchBuoys, fetchCpenStats, fetchVaultStats]);

  // ── INSTRUCCIÓN: Registrar boya ───────────────────────
  const registerBuoy = useCallback(
    async (
      buoyId: string,
      latDeg: number,
      lngDeg: number,
      locationName: string
    ) => {
      if (!program || !wallet.publicKey) return;
      setLoading(true);
      setTxStatus("Registrando boya...");
      try {
        const [buoyPda] = getBuoyPda(buoyId, wallet.publicKey);
        const tx = await program.methods
          .registerBuoy(
            buoyId,
            new BN(Math.round(latDeg * 100_000)),
            new BN(Math.round(lngDeg * 100_000)),
            locationName
          )
          .accounts({
            buoy:          buoyPda,
            operator:      wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        setTxStatus(`✅ Boya registrada | ${tx.slice(0, 8)}...`);
        setLastTxSignature(tx);
        await fetchBuoys();
      } catch (e: any) {
        setTxStatus(`❌ ${friendlyError(e)}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getBuoyPda, fetchBuoys]
  );

  // ── INSTRUCCIÓN: Submit reading ───────────────────────
  const submitReading = useCallback(
    async (
      buoyId: string,
      temperature: number,  // en °C, ej: 22.5
      salinity: number,     // en PSU, ej: 35.1
      waveHeight: number,   // en metros, ej: 0.85
      pollutionLevel: number
    ) => {
      if (!program || !wallet.publicKey) return;
      setLoading(true);
      setTxStatus("Enviando lectura...");
      try {
        const [buoyPda] = getBuoyPda(buoyId, wallet.publicKey);
        const buoyAcct = await program.account.buoyState.fetch(buoyPda) as any;
        const readingIndex = buoyAcct.totalReadings;

        const [readingPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("reading"),
            buoyPda.toBuffer(),
            readingIndex.toArrayLike(Buffer, "le", 8),
          ],
          PROGRAM_ID
        );

        const tx = await program.methods
          .submitReading(
            Math.round(temperature * 100),
            Math.round(salinity * 100),
            Math.round(waveHeight * 100),
            pollutionLevel,
            new BN(Math.floor(Date.now() / 1000))
          )
          .accounts({
            buoy:          buoyPda,
            reading:       readingPda,
            operator:      wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        setTxStatus(`✅ Lectura enviada | ${tx.slice(0, 8)}...`);
        setLastTxSignature(tx);
        await fetchBuoys();
      } catch (e: any) {
        setTxStatus(`❌ ${friendlyError(e)}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getBuoyPda, fetchBuoys]
  );

  // ── Helper: crear ATA Token-2022 si no existe ────────
  const ensureCpenAta = useCallback(
    async (cpenMint: PublicKey, ataAddress: PublicKey) => {
      const info = await connection.getAccountInfo(ataAddress);
      if (info) return;
      setTxStatus("Creando cuenta cPEN (primera vez)…");
      const ix = createAssociatedTokenAccountInstruction(
        wallet.publicKey!,
        ataAddress,
        wallet.publicKey!,
        cpenMint,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );
      const tx = new Transaction().add(ix);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey!;
      const signed = await wallet.signTransaction!(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
    },
    [connection, wallet]
  );

  // ── INSTRUCCIÓN: Claim reward en cPEN ────────────────
  const claimRewardAsCpen = useCallback(
    async (buoyId: string) => {
      if (!program || !wallet.publicKey) return;
      if (!CPEN_MINT_ADDRESS) {
        setTxStatus("❌ NEXT_PUBLIC_CPEN_MINT no configurado en .env.local");
        return;
      }
      setLoading(true);
      setTxStatus("Verificando cuenta cPEN…");
      try {
        const [buoyPda]       = getBuoyPda(buoyId, wallet.publicKey);
        const [mintConfigPda] = getMintConfigPda();
        const cpenMint        = new PublicKey(CPEN_MINT_ADDRESS);

        const operatorCpenAta = await getAssociatedTokenAddress(
          cpenMint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID
        );

        // Crear el ATA Token-2022 si el usuario no lo tiene aún
        await ensureCpenAta(cpenMint, operatorCpenAta);

        setTxStatus("Cobrando recompensa en cPEN…");
        const tx = await program.methods
          .claimRewardAsCpen()
          .accounts({
            buoy:                buoyPda,
            owner:               wallet.publicKey,
            mintConfig:          mintConfigPda,
            cpenMint:            cpenMint,
            operatorCpenAccount: operatorCpenAta,
            operator:            wallet.publicKey,
            tokenProgram2022:    TOKEN_2022_PROGRAM_ID,
            systemProgram:       SystemProgram.programId,
          })
          .rpc();
        setTxStatus(`✅ cPEN cobrado | ${tx.slice(0, 8)}...`);
        setLastTxSignature(tx);
        await Promise.all([fetchBuoys(), fetchCpenStats()]);
      } catch (e: any) {
        setTxStatus(`❌ ${friendlyError(e)}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getBuoyPda, getMintConfigPda, ensureCpenAta, fetchBuoys, fetchCpenStats]
  );

  // ── INSTRUCCIÓN: Claim reward en USDC crudo ──────────
  // Retira directo del vault institucional (fund_vault) en vez de mintear
  // cPEN — alternativa al claim de arriba, mismo unclaimed_usdc de origen.
  const claimReward = useCallback(
    async (buoyId: string) => {
      if (!program || !wallet.publicKey) return;
      setLoading(true);
      setTxStatus("Cobrando recompensa en USDC…");
      try {
        const [buoyPda]        = getBuoyPda(buoyId, wallet.publicKey);
        const [vaultStatePda]  = getVaultStatePda();
        const [vaultTokenPda]  = getVaultTokenPda();

        const operatorTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID
        );

        const tx = await program.methods
          .claimReward()
          .accounts({
            buoy:                buoyPda,
            owner:               wallet.publicKey,
            vaultState:          vaultStatePda,
            vaultTokenAccount:   vaultTokenPda,
            operatorTokenAccount,
            operator:            wallet.publicKey,
            tokenProgram:        TOKEN_PROGRAM_ID,
          })
          .rpc();
        setTxStatus(`✅ USDC cobrado | ${tx.slice(0, 8)}...`);
        setLastTxSignature(tx);
        await Promise.all([fetchBuoys(), fetchVaultStats()]);
      } catch (e: any) {
        setTxStatus(`❌ ${friendlyError(e)}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getBuoyPda, getVaultStatePda, getVaultTokenPda, fetchBuoys, fetchVaultStats]
  );

  // ── INSTRUCCIÓN: Mint cPEN con USDC ──────────────────
  const mintCpen = useCallback(
    async (usdcAmount: number) => {
      if (!program || !wallet.publicKey) return;
      if (!CPEN_MINT_ADDRESS) {
        setTxStatus("❌ NEXT_PUBLIC_CPEN_MINT no configurado en .env.local");
        return;
      }
      setLoading(true);
      setTxStatus("Verificando cuenta cPEN…");
      try {
        const [mintConfigPda] = getMintConfigPda();
        const cpenMint = new PublicKey(CPEN_MINT_ADDRESS);

        const usdcAta = await getAssociatedTokenAddress(
          USDC_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID
        );
        const cpenAta = await getAssociatedTokenAddress(
          cpenMint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID
        );
        const [collateralVault] = PublicKey.findProgramAddressSync(
          [Buffer.from("usdc_collateral"), USDC_MINT.toBuffer()],
          PROGRAM_ID
        );

        // Crear el ATA Token-2022 si no existe
        await ensureCpenAta(cpenMint, cpenAta);

        setTxStatus("Convirtiendo USDC → cPEN…");
        const tx = await program.methods
          .mintCpen(new BN(Math.round(usdcAmount * 1_000_000)))
          .accounts({
            mintConfig:          mintConfigPda,
            cpenMint:            cpenMint,
            userCpenAccount:     cpenAta,
            usdcSource:          usdcAta,
            usdcCollateralVault: collateralVault,
            user:                wallet.publicKey,
            tokenProgramLegacy:  TOKEN_PROGRAM_ID,
            tokenProgram2022:    TOKEN_2022_PROGRAM_ID,
            systemProgram:       SystemProgram.programId,
          })
          .rpc();
        setTxStatus(`✅ cPEN minted | ${tx.slice(0, 8)}...`);
        setLastTxSignature(tx);
        await fetchCpenStats();
      } catch (e: any) {
        setTxStatus(`❌ ${friendlyError(e)}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getMintConfigPda, ensureCpenAta, fetchCpenStats]
  );

  // ── INSTRUCCIÓN: Redeem cPEN → USDC ──────────────────
  const redeemCpen = useCallback(
    async (cpenAmount: number) => {
      if (!program || !wallet.publicKey) return;
      if (!CPEN_MINT_ADDRESS) {
        setTxStatus("❌ NEXT_PUBLIC_CPEN_MINT no configurado en .env.local");
        return;
      }
      setLoading(true);
      setTxStatus("Convirtiendo cPEN → USDC...");
      try {
        const [mintConfigPda] = getMintConfigPda();
        const cpenMint = new PublicKey(CPEN_MINT_ADDRESS);

        const usdcAta = await getAssociatedTokenAddress(
          USDC_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID
        );
        const cpenAta = await getAssociatedTokenAddress(
          cpenMint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID
        );
        const [collateralVault] = PublicKey.findProgramAddressSync(
          [Buffer.from("usdc_collateral"), USDC_MINT.toBuffer()],
          PROGRAM_ID
        );

        const tx = await program.methods
          .redeemCpen(new BN(Math.round(cpenAmount * 100)))
          .accounts({
            mintConfig:             mintConfigPda,
            cpenMint:               cpenMint,
            userCpenAccount:        cpenAta,
            usdcDestination:        usdcAta,
            usdcCollateralVault:    collateralVault,
            user:                   wallet.publicKey,
            tokenProgramLegacy:     TOKEN_PROGRAM_ID,
            tokenProgram2022:       TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram:          SystemProgram.programId,
          })
          .rpc();
        setTxStatus(`✅ USDC recuperado | ${tx.slice(0, 8)}...`);
        setLastTxSignature(tx);
        await fetchCpenStats();
      } catch (e: any) {
        setTxStatus(`❌ ${friendlyError(e)}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getMintConfigPda, fetchCpenStats]
  );

  // ── INSTRUCCIÓN: Suscripción institucional (fund_vault) ──
  // Una institución (o cualquier wallet) deposita USDC en el vault del
  // protocolo. Es el mismo vault del que los operadores retiran vía
  // claim_reward — no hay dos flujos de dinero separados, es uno solo.
  const fundVault = useCallback(
    async (usdcAmount: number) => {
      if (!program || !wallet.publicKey) return;
      setLoading(true);
      setTxStatus("Procesando suscripción…");
      try {
        const [vaultStatePda] = getVaultStatePda();
        const [vaultTokenPda] = getVaultTokenPda();

        const funderTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID
        );

        const tx = await program.methods
          .fundVault(new BN(Math.round(usdcAmount * 1_000_000)))
          .accounts({
            vaultState:         vaultStatePda,
            vaultTokenAccount:  vaultTokenPda,
            funderTokenAccount,
            funder:             wallet.publicKey,
            tokenProgram:       TOKEN_PROGRAM_ID,
          })
          .rpc();
        setTxStatus(`✅ Suscripción confirmada | ${tx.slice(0, 8)}...`);
        setLastTxSignature(tx);
        await fetchVaultStats();
      } catch (e: any) {
        setTxStatus(`❌ ${friendlyError(e)}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getVaultStatePda, getVaultTokenPda, fetchVaultStats]
  );

  return {
    // Estado
    program,
    buoys,
    cpenStats,
    vaultStats,
    loading,
    txStatus,
    lastTxSignature,
    connected: !!wallet.publicKey,
    walletAddress: wallet.publicKey?.toBase58(),
    // Acciones
    registerBuoy,
    submitReading,
    claimRewardAsCpen,
    claimReward,
    mintCpen,
    redeemCpen,
    fundVault,
    // Refresh
    fetchBuoys,
    fetchCpenStats,
    fetchVaultStats,
  };
}