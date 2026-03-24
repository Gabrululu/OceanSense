import * as anchor from "@coral-xyz/anchor";
import { Program }  from "@coral-xyz/anchor";
import { assert }   from "chai";
import { Buffer }   from "buffer";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { OceanSense } from "../target/types/ocean_sense";

const BN = anchor.BN;

describe("🌊 Ocean-Sense Pay", () => {
  const provider  = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program  = anchor.workspace.OceanSense as Program<OceanSense>;
  const operator = provider.wallet as anchor.Wallet;

  const BUOY_ID   = "PAITA-001";
  const LAT       = new BN(-506200);
  const LNG       = new BN(-8143000);
  const BUOY_NAME = "Boya Paita Norte - Piura";

  let buoyPda:              anchor.web3.PublicKey;
  let vaultStatePda:        anchor.web3.PublicKey;
  let vaultTokenPda:        anchor.web3.PublicKey;
  let usdcMint:             anchor.web3.PublicKey;
  let operatorTokenAccount: anchor.web3.PublicKey;

  before(async () => {
    [buoyPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("buoy"), Buffer.from(BUOY_ID), operator.publicKey.toBuffer()],
      program.programId
    );
    console.log("📍 Program ID :", program.programId.toBase58());
    console.log("🔑 Operator   :", operator.publicKey.toBase58());
    console.log("🛟  Buoy PDA  :", buoyPda.toBase58());
  });

  it("Crea el USDC mock para Devnet", async () => {
    usdcMint = await createMint(
      provider.connection, operator.payer,
      operator.publicKey, operator.publicKey, 6
    );
    const ata = await getOrCreateAssociatedTokenAccount(
      provider.connection, operator.payer, usdcMint, operator.publicKey
    );
    operatorTokenAccount = ata.address;

    // Compute vault PDAs — seeds now include usdcMint (unique per mint run)
    [vaultStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), usdcMint.toBuffer()],
      program.programId
    );
    [vaultTokenPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_token"), usdcMint.toBuffer()],
      program.programId
    );

    console.log("💵 USDC mock mint:", usdcMint.toBase58());
    console.log("🏦 Vault PDA     :", vaultStatePda.toBase58());
    assert.ok(usdcMint);
  });

  it("Inicializa el vault global de USDC", async () => {
    const tx = await program.methods
      .initializeVault()
      .accounts({
        vaultState:        vaultStatePda,
        vaultTokenAccount: vaultTokenPda,
        usdcMint,
        authority:         operator.publicKey,
        tokenProgram:      TOKEN_PROGRAM_ID,
        systemProgram:     anchor.web3.SystemProgram.programId,
        rent:              anchor.web3.SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();
    console.log("\n✅ Vault inicializado | tx:", tx);
    const vs = await program.account.vaultState.fetch(vaultStatePda);
    assert.ok(vs.authority.equals(operator.publicKey));
    assert.ok(vs.usdcMint.equals(usdcMint));
  });

  it("Fondea el vault con 100 USDC para pagar operadores", async () => {
    await mintTo(
      provider.connection, operator.payer, usdcMint,
      operatorTokenAccount, operator.publicKey, 200_000_000
    );
    const FUND_AMOUNT = new BN(100_000_000);
    const tx = await program.methods
      .fundVault(FUND_AMOUNT)
      .accounts({
        vaultState:         vaultStatePda,
        vaultTokenAccount:  vaultTokenPda,
        funderTokenAccount: operatorTokenAccount,
        funder:             operator.publicKey,
        tokenProgram:       TOKEN_PROGRAM_ID,
      } as any)
      .rpc();
    console.log("\n💰 Vault fondeado | tx:", tx);
    const vs = await program.account.vaultState.fetch(vaultStatePda);
    assert.ok(vs.totalFunded.eq(FUND_AMOUNT));
  });

  it("Registra la boya en el litoral peruano", async () => {
    try {
      const tx = await program.methods
        .registerBuoy(BUOY_ID, LAT, LNG, BUOY_NAME)
        .accounts({
          buoy:          buoyPda,
          operator:      operator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
      console.log("\n🛟 Boya registrada | tx:", tx);
    } catch (e: any) {
      if ((e.message ?? "").includes("already in use")) {
        console.log("\n🛟 Boya ya existe en devnet — usando la existente");
      } else {
        throw e;
      }
    }
    const acct = await program.account.buoyState.fetch(buoyPda);
    assert.equal(acct.buoyId, BUOY_ID);
    assert.equal(acct.isActive, true);
  });

  it("Envía lecturas oceánicas y acumula recompensas", async () => {
    // Get current state to use dynamic reading indices
    const buoyBefore = await program.account.buoyState.fetch(buoyPda);
    const startIdx   = buoyBefore.totalReadings;
    const unclaimedBefore = buoyBefore.unclaimedUsdc;

    const idx0 = startIdx;
    const [readingPda0] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reading"), buoyPda.toBuffer(), idx0.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    await program.methods
      .submitReading(2250, 3510, 85, 0, new BN(Math.floor(Date.now() / 1000)))
      .accounts({
        buoy: buoyPda, reading: readingPda0,
        operator: operator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const idx1 = new BN(startIdx.toNumber() + 1);
    const [readingPda1] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reading"), buoyPda.toBuffer(), idx1.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    await program.methods
      .submitReading(1820, 3380, 210, 3, new BN(Math.floor(Date.now() / 1000)))
      .accounts({
        buoy: buoyPda, reading: readingPda1,
        operator: operator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const acct = await program.account.buoyState.fetch(buoyPda);
    const addedUsdc = acct.unclaimedUsdc.sub(unclaimedBefore);
    assert.ok(addedUsdc.eq(new BN(6_000_000)),
      `esperado +6 USDC, obtenido +${addedUsdc.toNumber() / 1e6}`);
    console.log("\n📊 USDC pendiente:", acct.unclaimedUsdc.toNumber() / 1e6, "USDC");
  });

  it("El operador cobra sus USDC acumulados", async () => {
    const buoyBefore    = await program.account.buoyState.fetch(buoyPda);
    const amountToClaim = buoyBefore.unclaimedUsdc.toNumber();
    assert.ok(amountToClaim > 0, "No hay USDC pendiente de cobrar");

    const balanceBefore = (await provider.connection
      .getTokenAccountBalance(operatorTokenAccount)).value.uiAmount;

    const tx = await program.methods
      .claimReward()
      .accounts({
        buoy:                 buoyPda,
        owner:                operator.publicKey,
        vaultState:           vaultStatePda,
        vaultTokenAccount:    vaultTokenPda,
        operatorTokenAccount,
        operator:             operator.publicKey,
        tokenProgram:         TOKEN_PROGRAM_ID,
      } as any)
      .rpc();
    console.log("\n🎉 Recompensa cobrada | tx:", tx);

    const balanceAfter = (await provider.connection
      .getTokenAccountBalance(operatorTokenAccount)).value.uiAmount;
    const acct = await program.account.buoyState.fetch(buoyPda);
    const vs   = await program.account.vaultState.fetch(vaultStatePda);

    assert.ok(acct.unclaimedUsdc.eq(new BN(0)));
    assert.ok(vs.totalPaid.toNumber() >= amountToClaim);
    console.log("   Ganancia:", (balanceAfter! - balanceBefore!).toFixed(6), "USDC");
  });

  it("Rechaza claim cuando no hay USDC pendiente", async () => {
    try {
      await program.methods
        .claimReward()
        .accounts({
          buoy:                 buoyPda,
          owner:                operator.publicKey,
          vaultState:           vaultStatePda,
          vaultTokenAccount:    vaultTokenPda,
          operatorTokenAccount,
          operator:             operator.publicKey,
          tokenProgram:         TOKEN_PROGRAM_ID,
        } as any)
        .rpc();
      assert.fail("Debió fallar con NothingToClaim");
    } catch (err: any) {
      const ok = (err.message ?? "").includes("NothingToClaim") ||
                 (err.message ?? "").includes("6005");
      assert.ok(ok, err.message);
      console.log("\n✅ Error esperado: NothingToClaim ✓");
    }
  });
});
