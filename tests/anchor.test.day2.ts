import * as anchor from "@coral-xyz/anchor";
import { Program }  from "@coral-xyz/anchor";
import { assert }   from "chai";
import { Buffer }   from "buffer";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";

import { OceanSense } from "../target/types/ocean_sense";

const BN = anchor.BN;

describe("💵 cPEN Token — Día 2", () => {
  const provider  = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program  = anchor.workspace.OceanSense as Program<OceanSense>;
  const operator = provider.wallet as anchor.Wallet;

  const BUOY_ID = "PAITA-001";

  let buoyPda:             anchor.web3.PublicKey;
  let mintConfigPda:       anchor.web3.PublicKey;
  let usdcCollateralVault: anchor.web3.PublicKey;
  let cpenMint:            anchor.web3.PublicKey;
  let usdcMint:            anchor.web3.PublicKey;
  let operatorUsdcAccount: anchor.web3.PublicKey;
  let operatorCpenAccount: anchor.web3.PublicKey;

  before(async () => {
    [buoyPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("buoy"), Buffer.from(BUOY_ID), operator.publicKey.toBuffer()],
      program.programId
    );
    // mintConfigPda se computa en "Prepara mints" (necesita usdcMint en seeds)
  });

  it("Prepara mints para Devnet", async () => {
    usdcMint = await createMint(
      provider.connection, operator.payer,
      operator.publicKey, operator.publicKey, 6
    );
    cpenMint = await createMint(
      provider.connection, operator.payer,
      operator.publicKey, operator.publicKey, 2,
      undefined, { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID
    );

    const usdcAta = await getOrCreateAssociatedTokenAccount(
      provider.connection, operator.payer, usdcMint, operator.publicKey
    );
    operatorUsdcAccount = usdcAta.address;

    const cpenAta = await getOrCreateAssociatedTokenAccount(
      provider.connection, operator.payer, cpenMint, operator.publicKey,
      false, "confirmed", { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID
    );
    operatorCpenAccount = cpenAta.address;

    await mintTo(
      provider.connection, operator.payer, usdcMint,
      operatorUsdcAccount, operator.publicKey, 500_000_000
    );

    [usdcCollateralVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("usdc_collateral"), usdcMint.toBuffer()],
      program.programId
    );

    // mint_config PDA ahora incluye usdcMint en sus seeds (único por corrida)
    [mintConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint_config"), usdcMint.toBuffer()],
      program.programId
    );
    console.log("💵 Mint Config PDA:", mintConfigPda.toBase58());

    // Transferir mint authority del cPEN al mint_config PDA
    // (el programa necesita firmar los mint_to con ese PDA)
    await setAuthority(
      provider.connection, operator.payer, cpenMint,
      operator.publicKey, AuthorityType.MintTokens, mintConfigPda,
      [], { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID
    );
    console.log("🔑 Mint authority transferida a:", mintConfigPda.toBase58());

    console.log("✅ USDC mock:", usdcMint.toBase58());
    console.log("✅ cPEN mock:", cpenMint.toBase58());
    assert.ok(usdcMint);
    assert.ok(cpenMint);
  });

  it("Inicializa la configuración del cPEN", async () => {
    const tx = await program.methods
      .initializeCpenMint()
      .accounts({
        mintConfig:          mintConfigPda,
        cpenMint,
        usdcMint,
        usdcCollateralVault,
        authority:           operator.publicKey,
        tokenProgramLegacy:  TOKEN_PROGRAM_ID,
        tokenProgram2022:    TOKEN_2022_PROGRAM_ID,
        systemProgram:       anchor.web3.SystemProgram.programId,
        rent:                anchor.web3.SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();
    console.log("\n✅ Mint config inicializado | tx:", tx);

    const cfg = await program.account.cpenMintConfig.fetch(mintConfigPda);
    assert.ok(cfg.cpenMint.equals(cpenMint));
    assert.ok(cfg.usdcMint.equals(usdcMint));
    assert.ok(cfg.totalMinted.eq(new BN(0)));
    console.log("   Rate: 1 USDC = 3.80 cPEN");
  });

  it("Deposita 10 USDC y recibe 38 cPEN", async () => {
    const USDC_IN = new BN(10_000_000);
    const tx = await program.methods
      .mintCpen(USDC_IN)
      .accounts({
        mintConfig:          mintConfigPda,
        cpenMint,
        userCpenAccount:     operatorCpenAccount,
        usdcSource:          operatorUsdcAccount,
        usdcCollateralVault,
        user:               operator.publicKey,
        tokenProgramLegacy: TOKEN_PROGRAM_ID,
        tokenProgram2022:   TOKEN_2022_PROGRAM_ID,
        systemProgram:      anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();
    console.log("\n💵 cPEN minted | tx:", tx);

    const cpenBal = await getAccount(
      provider.connection, operatorCpenAccount, "confirmed", TOKEN_2022_PROGRAM_ID
    );
    assert.equal(cpenBal.amount.toString(), "3800",
      `esperado 3800, obtenido ${cpenBal.amount.toString()}`);
    console.log("   cPEN recibido:", Number(cpenBal.amount) / 100, "cPEN");
  });

  it("Quema 19 cPEN y recupera ~5 USDC", async () => {
    const CPEN_IN    = new BN(1900);
    const usdcBefore = await getAccount(provider.connection, operatorUsdcAccount);

    await program.methods
      .redeemCpen(CPEN_IN)
      .accounts({
        mintConfig:          mintConfigPda,
        cpenMint,
        userCpenAccount:     operatorCpenAccount,
        usdcDestination:     operatorUsdcAccount,
        usdcCollateralVault,
        user:                operator.publicKey,
        tokenProgramLegacy:  TOKEN_PROGRAM_ID,
        tokenProgram2022:    TOKEN_2022_PROGRAM_ID,
        systemProgram:       anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const usdcAfter    = await getAccount(provider.connection, operatorUsdcAccount);
    const usdcRecovered = Number(usdcAfter.amount - usdcBefore.amount);
    console.log("\n🔄 Redeem | USDC recuperado:", usdcRecovered / 1e6, "USDC");
    assert.equal(usdcRecovered, 5_000_000);
  });

  it("Cobra recompensa de Ocean-Sense directamente en cPEN", async () => {
    const buoyAcct    = await program.account.buoyState.fetch(buoyPda);
    const pendingUsdc = buoyAcct.unclaimedUsdc.toNumber();
    console.log("\n📊 USDC pendiente en boya:", pendingUsdc / 1e6, "USDC");

    if (pendingUsdc === 0) {
      console.log("   (No hay USDC pendiente — ejecuta los tests del Día 1 primero)");
      return;
    }

    const cpenBefore = await getAccount(
      provider.connection, operatorCpenAccount, "confirmed", TOKEN_2022_PROGRAM_ID
    );

    await program.methods
      .claimRewardAsCpen()
      .accounts({
        buoy:                buoyPda,
        owner:               operator.publicKey,
        mintConfig:          mintConfigPda,
        cpenMint,
        operatorCpenAccount,
        operator:           operator.publicKey,
        tokenProgram2022:   TOKEN_2022_PROGRAM_ID,
        systemProgram:      anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const cpenAfter    = await getAccount(
      provider.connection, operatorCpenAccount, "confirmed", TOKEN_2022_PROGRAM_ID
    );
    const cpenEarned   = Number(cpenAfter.amount - cpenBefore.amount);
    const expectedCpen = Math.floor(pendingUsdc * 380 / 1_000_000);
    console.log("   cPEN ganado:", cpenEarned / 100, "cPEN");
    assert.equal(cpenEarned, expectedCpen);

    const buoyFinal = await program.account.buoyState.fetch(buoyPda);
    assert.ok(buoyFinal.unclaimedUsdc.eq(new BN(0)));
  });

  it("Verifica el estado final del protocolo cPEN", async () => {
    const cfg = await program.account.cpenMintConfig.fetch(mintConfigPda);
    console.log("\n📋 Estado final:");
    console.log("   Total minted:  ", cfg.totalMinted.toNumber() / 100, "cPEN");
    console.log("   Total redeemed:", cfg.totalRedeemed.toNumber() / 100, "cPEN");
    assert.ok(cfg.authority.equals(operator.publicKey));
    console.log("\n✅ Día 2 completo — token cPEN operativo en Devnet");
  });
});
