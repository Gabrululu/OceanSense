"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";

// ── Constantes ───────────────────────────────────────────
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);
const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
const CPEN_MINT_ADDRESS = process.env.NEXT_PUBLIC_CPEN_MINT || "";

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

// ── Hook principal ────────────────────────────────────────
export function useOceanSense() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [program, setProgram] = useState<Program | null>(null);
  const [buoys, setBuoys] = useState<BuoyData[]>([]);
  const [cpenStats, setCpenStats] = useState<CpenStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // ── Inicializar programa Anchor ───────────────────────
  useEffect(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return;

    const provider = new AnchorProvider(
      connection,
      wallet as any,
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
  }, [wallet.publicKey, connection]);

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
      PublicKey.findProgramAddressSync([Buffer.from("mint_config")], PROGRAM_ID),
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

  useEffect(() => {
    if (program) {
      fetchBuoys();
      fetchCpenStats();
    }
  }, [program, fetchBuoys, fetchCpenStats]);

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
        await fetchBuoys();
      } catch (e: any) {
        setTxStatus(`❌ Error: ${e.message}`);
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
        await fetchBuoys();
      } catch (e: any) {
        setTxStatus(`❌ Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getBuoyPda, fetchBuoys]
  );

  // ── INSTRUCCIÓN: Claim reward en cPEN ────────────────
  const claimRewardAsCpen = useCallback(
    async (buoyId: string) => {
      if (!program || !wallet.publicKey || !CPEN_MINT_ADDRESS) return;
      setLoading(true);
      setTxStatus("Cobrando recompensa en cPEN...");
      try {
        const [buoyPda]       = getBuoyPda(buoyId, wallet.publicKey);
        const [mintConfigPda] = getMintConfigPda();
        const cpenMint        = new PublicKey(CPEN_MINT_ADDRESS);

        const operatorCpenAta = await getAssociatedTokenAddress(
          cpenMint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID
        );

        const tx = await program.methods
          .claimRewardAsCpen()
          .accounts({
            buoy:                   buoyPda,
            owner:                  wallet.publicKey,
            mintConfig:             mintConfigPda,
            cpenMint:               cpenMint,
            operatorCpenAccount:    operatorCpenAta,
            operator:               wallet.publicKey,
            tokenProgram2022:       TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram:          SystemProgram.programId,
          })
          .rpc();
        setTxStatus(`✅ cPEN cobrado | ${tx.slice(0, 8)}...`);
        await Promise.all([fetchBuoys(), fetchCpenStats()]);
      } catch (e: any) {
        setTxStatus(`❌ Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getBuoyPda, getMintConfigPda, fetchBuoys, fetchCpenStats]
  );

  // ── INSTRUCCIÓN: Mint cPEN con USDC ──────────────────
  const mintCpen = useCallback(
    async (usdcAmount: number) => {
      if (!program || !wallet.publicKey || !CPEN_MINT_ADDRESS) return;
      setLoading(true);
      setTxStatus("Convirtiendo USDC → cPEN...");
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
          .mintCpen(new BN(Math.round(usdcAmount * 1_000_000)))
          .accounts({
            mintConfig:             mintConfigPda,
            cpenMint:               cpenMint,
            userCpenAccount:        cpenAta,
            usdcSource:             usdcAta,
            usdcCollateralVault:    collateralVault,
            user:                   wallet.publicKey,
            tokenProgramLegacy:     TOKEN_PROGRAM_ID,
            tokenProgram2022:       TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram:          SystemProgram.programId,
          })
          .rpc();
        setTxStatus(`✅ cPEN minted | ${tx.slice(0, 8)}...`);
        await fetchCpenStats();
      } catch (e: any) {
        setTxStatus(`❌ Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getMintConfigPda, fetchCpenStats]
  );

  // ── INSTRUCCIÓN: Redeem cPEN → USDC ──────────────────
  const redeemCpen = useCallback(
    async (cpenAmount: number) => {
      if (!program || !wallet.publicKey || !CPEN_MINT_ADDRESS) return;
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
        await fetchCpenStats();
      } catch (e: any) {
        setTxStatus(`❌ Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, getMintConfigPda, fetchCpenStats]
  );

  return {
    // Estado
    program,
    buoys,
    cpenStats,
    loading,
    txStatus,
    connected: !!wallet.publicKey,
    walletAddress: wallet.publicKey?.toBase58(),
    // Acciones
    registerBuoy,
    submitReading,
    claimRewardAsCpen,
    mintCpen,
    redeemCpen,
    // Refresh
    fetchBuoys,
    fetchCpenStats,
  };
}