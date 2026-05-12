export interface BuoyData {
  publicKey: string;
  buoyId: string;
  owner: string;
  latitude: number;       // degrees (÷ 100,000)
  longitude: number;
  locationName: string;
  isActive: boolean;
  totalReadings: number;
  totalRewards: number;   // USDC (÷ 1,000,000)
  unclaimedUsdc: number;
  lastReadingTimestamp: number;
}

export interface CpenStats {
  totalMinted: number;
  totalRedeemed: number;
  usdcBalance: number;
  cpenBalance: number;
}

export interface OceanSenseConfig {
  /** Solana RPC connection */
  connection: import("@solana/web3.js").Connection;
  /** Operator keypair — holds the private key that signs readings */
  keypair: import("@solana/web3.js").Keypair;
  /** Override default program ID (EawytSiCAZ6tKx6t1bVFmSb8Y7uTUbxMdydrokCiR71N) */
  programId?: string;
  /** Override default Devnet USDC mint (4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU) */
  usdcMint?: string;
  /** cPEN Token-2022 mint address (optional, required for cPEN operations) */
  cpenMint?: string;
}

export interface RegisterBuoyParams {
  buoyId: string;         // max 32 chars
  latDeg: number;         // e.g. -5.0623
  lngDeg: number;         // e.g. -81.4300
  locationName: string;   // max 64 chars
}

export interface SubmitReadingParams {
  buoyId: string;
  temperature: number;    // °C, e.g. 22.5
  salinity: number;       // PSU, e.g. 35.1
  waveHeight: number;     // meters, e.g. 0.85
  pollutionLevel: 0 | 1 | 2 | 3;
}
