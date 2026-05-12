import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";
import type {
  BuoyData,
  CpenStats,
  OceanSenseConfig,
  RegisterBuoyParams,
  SubmitReadingParams,
} from "./types.js";

// ── IDL (Anchor 0.29 format) ──────────────────────────────────────
const IDL = {
  version: "0.1.0",
  name: "ocean_sense",
  instructions: [
    {
      name: "registerBuoy",
      accounts: [
        { name: "buoy", isMut: true, isSigner: false },
        { name: "operator", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "buoyId", type: "string" },
        { name: "latitude", type: "i64" },
        { name: "longitude", type: "i64" },
        { name: "locationName", type: "string" },
      ],
    },
    {
      name: "submitReading",
      accounts: [
        { name: "buoy", isMut: true, isSigner: false },
        { name: "reading", isMut: true, isSigner: false },
        { name: "operator", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "temperature", type: "i32" },
        { name: "salinity", type: "u32" },
        { name: "waveHeight", type: "u32" },
        { name: "pollutionLevel", type: "u8" },
        { name: "timestamp", type: "i64" },
      ],
    },
    {
      name: "claimRewardAsCpen",
      accounts: [
        { name: "buoy", isMut: true, isSigner: false },
        { name: "owner", isMut: false, isSigner: false },
        { name: "mintConfig", isMut: true, isSigner: false },
        { name: "cpenMint", isMut: true, isSigner: false },
        { name: "operatorCpenAccount", isMut: true, isSigner: false },
        { name: "operator", isMut: true, isSigner: true },
        { name: "tokenProgram2022", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "buoyState",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "buoyId", type: "string" },
          { name: "latitude", type: "i64" },
          { name: "longitude", type: "i64" },
          { name: "locationName", type: "string" },
          { name: "isActive", type: "bool" },
          { name: "totalReadings", type: "u64" },
          { name: "totalRewards", type: "u64" },
          { name: "unclaimedUsdc", type: "u64" },
          { name: "lastReadingTimestamp", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "cpenMintConfig",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "cpenMint", type: "publicKey" },
          { name: "usdcMint", type: "publicKey" },
          { name: "totalMinted", type: "u64" },
          { name: "totalRedeemed", type: "u64" },
          { name: "totalFeesCollected", type: "u64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "StringTooLong", msg: "String exceeds allowed length" },
    { code: 6001, name: "InvalidPollutionLevel", msg: "Invalid pollution level (0-3)" },
    { code: 6002, name: "BuoyNotActive", msg: "Buoy is not active" },
    { code: 6003, name: "Unauthorized", msg: "Only the owner can perform this action" },
    { code: 6004, name: "Overflow", msg: "Arithmetic overflow" },
    { code: 6005, name: "NothingToClaim", msg: "No pending rewards to claim" },
    { code: 6006, name: "InsufficientVaultFunds", msg: "Vault has insufficient funds" },
    { code: 6007, name: "InvalidAmount", msg: "Invalid amount" },
  ],
} as const;

const DEFAULT_PROGRAM_ID = "EawytSiCAZ6tKx6t1bVFmSb8Y7uTUbxMdydrokCiR71N";
const DEFAULT_USDC_MINT  = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

// ── OceanSenseClient ──────────────────────────────────────────────
export class OceanSenseClient {
  private program: Program;
  private programId: PublicKey;
  private usdcMint: PublicKey;
  private cpenMintPk: PublicKey | null;
  private keypair: Keypair;

  constructor(config: OceanSenseConfig) {
    this.keypair   = config.keypair;
    this.programId = new PublicKey(config.programId ?? DEFAULT_PROGRAM_ID);
    this.usdcMint  = new PublicKey(config.usdcMint  ?? DEFAULT_USDC_MINT);
    this.cpenMintPk = config.cpenMint ? new PublicKey(config.cpenMint) : null;

    const wallet   = new Wallet(config.keypair);
    const provider = new AnchorProvider(config.connection, wallet, { commitment: "confirmed" });
    this.program   = new Program(IDL as any, this.programId as any, provider as any);
  }

  // ── PDA helpers ──────────────────────────────────────────────────

  getBuoyPda(buoyId: string, owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("buoy"), Buffer.from(buoyId), owner.toBuffer()],
      this.programId
    );
  }

  getMintConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("mint_config"), this.usdcMint.toBuffer()],
      this.programId
    );
  }

  // ── Read operations ──────────────────────────────────────────────

  async fetchBuoys(): Promise<BuoyData[]> {
    const accounts = await this.program.account.buoyState.all();
    return accounts.map((a: any) => ({
      publicKey:            a.publicKey.toBase58(),
      buoyId:               a.account.buoyId,
      owner:                a.account.owner.toBase58(),
      latitude:             a.account.latitude.toNumber()  / 100_000,
      longitude:            a.account.longitude.toNumber() / 100_000,
      locationName:         a.account.locationName,
      isActive:             a.account.isActive,
      totalReadings:        a.account.totalReadings.toNumber(),
      totalRewards:         a.account.totalRewards.toNumber()  / 1_000_000,
      unclaimedUsdc:        a.account.unclaimedUsdc.toNumber() / 1_000_000,
      lastReadingTimestamp: a.account.lastReadingTimestamp.toNumber(),
    }));
  }

  async fetchCpenStats(): Promise<CpenStats | null> {
    if (!this.cpenMintPk) return null;
    const connection = (this.program.provider as AnchorProvider).connection;

    const [mintConfig] = this.getMintConfigPda();
    const cfg = await this.program.account.cpenMintConfig.fetch(mintConfig).catch(() => null) as any;

    const usdcAta = await getAssociatedTokenAddress(this.usdcMint, this.keypair.publicKey, false, TOKEN_PROGRAM_ID);
    const cpenAta = await getAssociatedTokenAddress(this.cpenMintPk, this.keypair.publicKey, false, TOKEN_2022_PROGRAM_ID);

    let usdcBalance = 0;
    let cpenBalance = 0;

    try { usdcBalance = Number((await getAccount(connection, usdcAta)).amount) / 1_000_000; } catch { /* no account */ }
    try { cpenBalance = Number((await getAccount(connection, cpenAta, "confirmed", TOKEN_2022_PROGRAM_ID)).amount) / 100; } catch { /* no account */ }

    return {
      totalMinted:   cfg ? cfg.totalMinted.toNumber()   / 100 : 0,
      totalRedeemed: cfg ? cfg.totalRedeemed.toNumber() / 100 : 0,
      usdcBalance,
      cpenBalance,
    };
  }

  // ── Write operations ─────────────────────────────────────────────

  async registerBuoy(params: RegisterBuoyParams): Promise<string> {
    const { buoyId, latDeg, lngDeg, locationName } = params;
    const [buoyPda] = this.getBuoyPda(buoyId, this.keypair.publicKey);

    const tx = await this.program.methods
      .registerBuoy(
        buoyId,
        new BN(Math.round(latDeg * 100_000)),
        new BN(Math.round(lngDeg * 100_000)),
        locationName
      )
      .accounts({
        buoy:          buoyPda,
        operator:      this.keypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async submitReading(params: SubmitReadingParams): Promise<string> {
    const { buoyId, temperature, salinity, waveHeight, pollutionLevel } = params;
    const [buoyPda] = this.getBuoyPda(buoyId, this.keypair.publicKey);

    const buoyAcct = await this.program.account.buoyState.fetch(buoyPda) as any;
    const readingIndex: typeof BN.prototype = buoyAcct.totalReadings;

    const [readingPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reading"),
        buoyPda.toBuffer(),
        readingIndex.toArrayLike(Buffer, "le", 8),
      ],
      this.programId
    );

    const tx = await this.program.methods
      .submitReading(
        Math.round(temperature * 100),
        Math.round(salinity    * 100),
        Math.round(waveHeight  * 100),
        pollutionLevel,
        new BN(Math.floor(Date.now() / 1000))
      )
      .accounts({
        buoy:          buoyPda,
        reading:       readingPda,
        operator:      this.keypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async claimRewardAsCpen(buoyId: string): Promise<string> {
    if (!this.cpenMintPk) throw new Error("cpenMint not configured");

    const [buoyPda]       = this.getBuoyPda(buoyId, this.keypair.publicKey);
    const [mintConfigPda] = this.getMintConfigPda();

    const operatorCpenAta = await getAssociatedTokenAddress(
      this.cpenMintPk, this.keypair.publicKey, false, TOKEN_2022_PROGRAM_ID
    );

    const tx = await this.program.methods
      .claimRewardAsCpen()
      .accounts({
        buoy:                buoyPda,
        owner:               this.keypair.publicKey,
        mintConfig:          mintConfigPda,
        cpenMint:            this.cpenMintPk,
        operatorCpenAccount: operatorCpenAta,
        operator:            this.keypair.publicKey,
        tokenProgram2022:    TOKEN_2022_PROGRAM_ID,
        systemProgram:       SystemProgram.programId,
      })
      .rpc();

    return tx;
  }
}
