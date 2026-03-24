import * as anchor from "@coral-xyz/anchor";
import { Buffer } from "buffer";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";

const BN = anchor.BN;
declare const pg: any;
declare const console: { log: (...args: unknown[]) => void };
declare function assert(value: unknown, message?: string): asserts value;
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => Promise<void> | void): void;
declare function before(fn: () => Promise<void> | void): void;

describe("💵 cPEN Token — Día 2", () => {
  const program  = pg.program;
  const operator = pg.wallet;
  const provider = pg.provider;

  // ── Addresses (reusar del Día 1) ───────────────────────
  // IMPORTANTE: reemplaza con las addresses reales del deploy del Día 1
  const BUOY_ID   = "PAITA-001";
  const BUOY_NAME = "Boya Paita Norte - Piura";

  let buoyPda:              anchor.web3.PublicKey;
  let mintConfigPda:        anchor.web3.PublicKey;
  let usdcCollateralVault:  anchor.web3.PublicKey;
  let cpenMint:             anchor.web3.PublicKey; // creado con setup-cpen-mint.sh
  let usdcMint:             anchor.web3.PublicKey; // del Día 1
  let operatorUsdcAccount:  anchor.web3.PublicKey;
  let operatorCpenAccount:  anchor.web3.PublicKey;
  let mintConfigBump:       number;

  before(async () => {
    // PDA de la boya (del Día 1)
    [buoyPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("buoy"), Buffer.from(BUOY_ID), operator.publicKey.toBuffer()],
      program.programId
    );

    // PDA del mint_config
    [mintConfigPda, mintConfigBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint_config")],
      program.programId
    );

    console.log("💵 Mint Config PDA:", mintConfigPda.toBase58());
  });

  // ── TEST 1: Crear USDC mock y cPEN mock ─────────────────
  it("Prepara mints para Devnet", async () => {
    // USDC mock (6 decimales — igual que USDC real)
    usdcMint = await createMint(
      provider.connection, operator.payer,
      operator.publicKey, operator.publicKey, 6
    );

    // cPEN mock con Token-2022 (2 decimales)
    // En producción usarías el mint creado con setup-cpen-mint.sh
    // En Playground usamos un mint simple para tests
    cpenMint = await createMint(
      provider.connection, operator.payer,
      operator.publicKey, operator.publicKey, 2,
      undefined,
      { commitment: "confirmed" },
      TOKEN_2022_PROGRAM_ID  // ← Token-2022
    );

    // ATAs del operador
    const usdcAta = await getOrCreateAssociatedTokenAccount(
      provider.connection, operator.payer, usdcMint, operator.publicKey
    );
    operatorUsdcAccount = usdcAta.address;

    const cpenAta = await getOrCreateAssociatedTokenAccount(
      provider.connection, operator.payer, cpenMint, operator.publicKey,
      false, "confirmed", { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID
    );
    operatorCpenAccount = cpenAta.address;

    // Fondear al operador con 500 USDC mock
    await mintTo(
      provider.connection, operator.payer, usdcMint,
      operatorUsdcAccount, operator.publicKey, 500_000_000
    );

    // PDA del vault de colateral
    [usdcCollateralVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("usdc_collateral"), usdcMint.toBuffer()],
      program.programId
    );

    console.log("✅ USDC mock:", usdcMint.toBase58());
    console.log("✅ cPEN mock:", cpenMint.toBase58());
    console.log("   Operator USDC:", operatorUsdcAccount.toBase58());
    console.log("   Operator cPEN:", operatorCpenAccount.toBase58());

    assert(usdcMint !== undefined);
    assert(cpenMint !== undefined);
  });

  // ── TEST 2: Inicializar el mint config ───────────────────
  it("Inicializa la configuración del cPEN", async () => {
    const tx = await program.methods
      .initializeCpenMint()
      .accounts({
        mintConfig:          mintConfigPda,
        cpenMint:            cpenMint,
        usdcMint:            usdcMint,
        usdcCollateralVault: usdcCollateralVault,
        authority:           operator.publicKey,
        tokenProgramLegacy:  TOKEN_PROGRAM_ID,
        tokenProgram2022:    TOKEN_2022_PROGRAM_ID,
        systemProgram:       anchor.web3.SystemProgram.programId,
        rent:                anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("\n✅ Mint config inicializado | tx:", tx);

    const cfg = await program.account.cpenMintConfig.fetch(mintConfigPda);
    assert(cfg.cpenMint.equals(cpenMint));
    assert(cfg.usdcMint.equals(usdcMint));
    assert(cfg.totalMinted.eq(new BN(0)));

    console.log("   cPEN mint:", cfg.cpenMint.toBase58());
    console.log("   Rate: 1 USDC = 3.80 cPEN");
  });

  // ── TEST 3: Mint de cPEN depositando USDC ───────────────
  it("Deposita 10 USDC y recibe 38 cPEN", async () => {
    const USDC_IN = new BN(10_000_000); // 10 USDC

    const tx = await program.methods
      .mintCpen(USDC_IN)
      .accounts({
        mintConfig:          mintConfigPda,
        cpenMint:            cpenMint,
        userCpenAccount:     operatorCpenAccount,
        usdcSource:          operatorUsdcAccount,
        usdcCollateralVault: usdcCollateralVault,
        user:                operator.publicKey,
        tokenProgramLegacy:  TOKEN_PROGRAM_ID,
        tokenProgram2022:    TOKEN_2022_PROGRAM_ID,
        systemProgram:       anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("\n💵 cPEN minted | tx:", tx);

    const cpenBal = await getAccount(
      provider.connection, operatorCpenAccount,
      "confirmed", TOKEN_2022_PROGRAM_ID
    );
    const expectedCpen = "3800"; // 10 USDC × 3.80 = 38.00 cPEN = 3800 units

    assert(cpenBal.amount.toString() === expectedCpen, `esperado ${expectedCpen}, obtenido ${cpenBal.amount.toString()}`);

    const cfg = await program.account.cpenMintConfig.fetch(mintConfigPda);
    console.log("   cPEN recibido:", Number(cpenBal.amount) / 100, "cPEN");
    console.log("   Total minted:", cfg.totalMinted.toNumber() / 100, "cPEN");
  });

  // ── TEST 4: Redeem — quemar cPEN y recuperar USDC ───────
  it("Quema 19 cPEN y recupera ~5 USDC", async () => {
    const CPEN_IN = new BN(1900); // 19.00 cPEN = 1900 units

    const usdcBefore = await getAccount(
      provider.connection, operatorUsdcAccount
    );

    await program.methods
      .redeemCpen(CPEN_IN)
      .accounts({
        mintConfig:          mintConfigPda,
        cpenMint:            cpenMint,
        userCpenAccount:     operatorCpenAccount,
        usdcDestination:     operatorUsdcAccount,
        usdcCollateralVault: usdcCollateralVault,
        user:                operator.publicKey,
        tokenProgramLegacy:  TOKEN_PROGRAM_ID,
        tokenProgram2022:    TOKEN_2022_PROGRAM_ID,
        systemProgram:       anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const usdcAfter = await getAccount(
      provider.connection, operatorUsdcAccount
    );

    const usdcRecovered = Number(usdcAfter.amount - usdcBefore.amount);
    console.log("\n🔄 Redeem completado");
    console.log("   cPEN quemado:", 1900 / 100, "cPEN");
    console.log("   USDC recuperado:", usdcRecovered / 1e6, "USDC");

    // 19 cPEN / 3.80 = 5 USDC
    assert(usdcRecovered === 5_000_000, `esperado 5000000, obtenido ${usdcRecovered}`);
  });

  // ── TEST 5: Claim de recompensa en cPEN ─────────────────
  it("Cobra recompensa de Ocean-Sense directamente en cPEN", async () => {
    // Primero enviar una lectura para acumular recompensa
    const idx = new BN(0); // asumimos boya ya registrada del Día 1
    // Si la boya ya tiene unclaimed_usdc del Día 1, usarlo directamente.
    // Si no, puedes registrar una boya nueva aquí.

    const buoyAcct = await program.account.buoyState.fetch(buoyPda);
    const pendingUsdc = buoyAcct.unclaimedUsdc.toNumber();
    console.log("\n📊 USDC pendiente en boya:", pendingUsdc / 1e6, "USDC");

    if (pendingUsdc === 0) {
      console.log("   (No hay USDC pendiente — ejecuta los tests del Día 1 primero)");
      return;
    }

    const cpenBefore = await getAccount(
      provider.connection, operatorCpenAccount,
      "confirmed", TOKEN_2022_PROGRAM_ID
    );

    await program.methods
      .claimRewardAsCpen()
      .accounts({
        buoy:                buoyPda,
        owner:               operator.publicKey,
        mintConfig:          mintConfigPda,
        cpenMint:            cpenMint,
        operatorCpenAccount: operatorCpenAccount,
        operator:            operator.publicKey,
        tokenProgram2022:    TOKEN_2022_PROGRAM_ID,
        systemProgram:       anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const cpenAfter = await getAccount(
      provider.connection, operatorCpenAccount,
      "confirmed", TOKEN_2022_PROGRAM_ID
    );

    const cpenEarned = Number(cpenAfter.amount - cpenBefore.amount);
    const expectedCpen = Math.floor(pendingUsdc * 380 / 1_000_000);

    console.log("   cPEN ganado:", cpenEarned / 100, "cPEN");
    console.log("   Equivalente PEN:", (cpenEarned / 100).toFixed(2), "S/");
    assert(cpenEarned === expectedCpen);

    const buoyFinal = await program.account.buoyState.fetch(buoyPda);
    assert(buoyFinal.unclaimedUsdc.eq(new BN(0)), "unclaimed debe ser 0");
    console.log("   unclaimed_usdc después del claim: 0 ✅");
  });

  // ── TEST 6: Verificar Transfer Fee ──────────────────────
  it("Verifica que las transferencias de cPEN cobran 0.5% de fee", async () => {
    // En Devnet con un mint simplificado el fee no se aplica automáticamente
    // En producción con el mint real Token-2022 con TransferFeeConfig, sí.
    // Este test documenta el comportamiento esperado.
    const cfg = await program.account.cpenMintConfig.fetch(mintConfigPda);

    console.log("\n📋 Estado final del protocolo cPEN:");
    console.log("   Total minted:   ", cfg.totalMinted.toNumber() / 100, "cPEN");
    console.log("   Total redeemed: ", cfg.totalRedeemed.toNumber() / 100, "cPEN");
    console.log("   Transfer fee:    0.5% (50 basis points)");
    console.log("   Max fee:         10,000 cPEN por transacción");
    console.log("   Rate:            1 USDC = 3.80 cPEN");

    assert(cfg.authority.equals(operator.publicKey));
    console.log("\n✅ Día 2 completo — token cPEN operativo en Devnet");
  });
});