import * as anchor from "@coral-xyz/anchor";
import { Buffer } from "buffer";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const BN = anchor.BN;
declare const pg: any;
declare const console: { log: (...args: unknown[]) => void };
declare function assert(value: unknown, message?: string): asserts value;
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => Promise<void> | void): void;
declare function before(fn: () => Promise<void> | void): void;

describe("🌊 Ocean-Sense Pay", () => {
  const program  = pg.program;
  const operator = pg.wallet;
  const provider = pg.provider;

  // ── Datos de prueba ──────────────────────────────────────
  const BUOY_ID  = "PAITA-001";
  const LAT      = new BN(-506200);
  const LNG      = new BN(-8143000);
  const BUOY_NAME = "Boya Paita Norte - Piura";

  let buoyPda:               anchor.web3.PublicKey;
  let vaultStatePda:         anchor.web3.PublicKey;
  let vaultTokenPda:         anchor.web3.PublicKey;
  let usdcMint:              anchor.web3.PublicKey;
  let operatorTokenAccount:  anchor.web3.PublicKey;
  let vaultStateBump:        number;

  // ── Derivar PDAs ────────────────────────────────────────
  before(async () => {
    // PDA de la boya
    [buoyPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("buoy"), Buffer.from(BUOY_ID), operator.publicKey.toBuffer()],
      program.programId
    );

    // PDA del vault state
    [vaultStatePda, vaultStateBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state")],
      program.programId
    );

    console.log("📍 Program ID :", program.programId.toBase58());
    console.log("🔑 Operator   :", operator.publicKey.toBase58());
    console.log("🛟  Buoy PDA  :", buoyPda.toBase58());
    console.log("🏦 Vault PDA  :", vaultStatePda.toBase58());
  });

  // ── TEST 1: Crear USDC mock en Devnet ───────────────────
  it("Crea el USDC mock para Devnet", async () => {
    // En Devnet creamos nuestro propio "USDC" para tests
    usdcMint = await createMint(
      provider.connection,
      operator.payer,      // payer
      operator.publicKey,  // mint authority
      operator.publicKey,  // freeze authority
      6                    // decimales (igual que USDC real)
    );
    console.log("💵 USDC mock mint:", usdcMint.toBase58());

    // ATA del operador para recibir USDC
    const ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      operator.payer,
      usdcMint,
      operator.publicKey
    );
    operatorTokenAccount = ata.address;
    console.log("💳 Operator ATA :", operatorTokenAccount.toBase58());

    assert(usdcMint !== undefined);
  });

  // ── TEST 2: Inicializar el vault ─────────────────────────
  it("Inicializa el vault global de USDC", async () => {
    // PDA del token account del vault (depende del mint)
    [vaultTokenPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_token"), usdcMint.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializeVault()
      .accounts({
        vaultState:        vaultStatePda,
        vaultTokenAccount: vaultTokenPda,
        usdcMint:          usdcMint,
        authority:         operator.publicKey,
        tokenProgram:      TOKEN_PROGRAM_ID,
        systemProgram:     anchor.web3.SystemProgram.programId,
        rent:              anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("\n✅ Vault inicializado | tx:", tx);

    const vs = await program.account.vaultState.fetch(vaultStatePda);
    assert(vs.authority.equals(operator.publicKey));
    assert(vs.usdcMint.equals(usdcMint));
    assert(vs.totalFunded.eq(new BN(0)));
    console.log("   Authority:", vs.authority.toBase58());
    console.log("   USDC mint:", vs.usdcMint.toBase58());
  });

  // ── TEST 3: Fondear el vault ─────────────────────────────
  it("Fondea el vault con 100 USDC para pagar operadores", async () => {
    // Mintear 100 USDC al operador primero
    await mintTo(
      provider.connection,
      operator.payer,
      usdcMint,
      operatorTokenAccount,
      operator.publicKey,
      200_000_000 // 200 USDC (6 decimales)
    );

    const FUND_AMOUNT = new BN(100_000_000); // 100 USDC

    const tx = await program.methods
      .fundVault(FUND_AMOUNT)
      .accounts({
        vaultState:         vaultStatePda,
        vaultTokenAccount:  vaultTokenPda,
        funderTokenAccount: operatorTokenAccount,
        funder:             operator.publicKey,
        tokenProgram:       TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("\n💰 Vault fondeado | tx:", tx);

    const vs = await program.account.vaultState.fetch(vaultStatePda);
    assert(vs.totalFunded.eq(FUND_AMOUNT));
    console.log("   Total fondeado:", vs.totalFunded.toNumber() / 1e6, "USDC");
  });

  // ── TEST 4: Registrar boya ───────────────────────────────
  it("Registra la boya en el litoral peruano", async () => {
    const tx = await program.methods
      .registerBuoy(BUOY_ID, LAT, LNG, BUOY_NAME)
      .accounts({
        buoy:          buoyPda,
        operator:      operator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("\n🛟 Boya registrada | tx:", tx);

    const acct = await program.account.buoyState.fetch(buoyPda);
    assert(acct.buoyId === BUOY_ID);
    assert(acct.isActive === true);
    assert(acct.unclaimedUsdc.eq(new BN(0)));
    console.log("   ID:", acct.buoyId);
    console.log("   USDC pendiente:", acct.unclaimedUsdc.toString());
  });

  // ── TEST 5: Enviar 2 lecturas ────────────────────────────
  it("Envía lecturas oceánicas y acumula recompensas", async () => {
    // Lectura 1 — agua limpia (1 USDC)
    const idx0 = new BN(0);
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
      })
      .rpc();

    // Lectura 2 — contaminación crítica (5 USDC)
    const idx1 = new BN(1);
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
      })
      .rpc();

    const acct = await program.account.buoyState.fetch(buoyPda);
    const expected = new BN(6_000_000); // 1 + 5 USDC
    assert(acct.unclaimedUsdc.eq(expected));
    assert(acct.totalReadings.eq(new BN(2)));

    console.log("\n📊 Lecturas enviadas");
    console.log("   Total lecturas:", acct.totalReadings.toString());
    console.log("   USDC pendiente:", acct.unclaimedUsdc.toNumber() / 1e6, "USDC");
  });

  // ── TEST 6: Claim de recompensas ─────────────────────────
  it("El operador cobra sus 6 USDC acumulados", async () => {
    const balanceBefore = (await provider.connection
      .getTokenAccountBalance(operatorTokenAccount)).value.uiAmount;

    const tx = await program.methods
      .claimReward()
      .accounts({
        buoy:                buoyPda,
        owner:               operator.publicKey,
        vaultState:          vaultStatePda,
        vaultTokenAccount:   vaultTokenPda,
        operatorTokenAccount: operatorTokenAccount,
        operator:            operator.publicKey,
        tokenProgram:        TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("\n🎉 Recompensa cobrada | tx:", tx);

    const balanceAfter = (await provider.connection
      .getTokenAccountBalance(operatorTokenAccount)).value.uiAmount;

    const acct = await program.account.buoyState.fetch(buoyPda);
    const vs   = await program.account.vaultState.fetch(vaultStatePda);

    assert(acct.unclaimedUsdc.eq(new BN(0)), "unclaimed debe ser 0");
    assert(vs.totalPaid.eq(new BN(6_000_000)), "total pagado incorrecto");

    console.log("   Saldo antes:", balanceBefore, "USDC");
    console.log("   Saldo después:", balanceAfter, "USDC");
    console.log("   Ganancia:", (balanceAfter! - balanceBefore!).toFixed(6), "USDC");
    console.log("   Vault total pagado:", vs.totalPaid.toNumber() / 1e6, "USDC");
  });

  // ── TEST 7: Claim vacío rechazado ────────────────────────
  it("Rechaza claim cuando no hay USDC pendiente", async () => {
    try {
      await program.methods
        .claimReward()
        .accounts({
          buoy:                buoyPda,
          owner:               operator.publicKey,
          vaultState:          vaultStatePda,
          vaultTokenAccount:   vaultTokenPda,
          operatorTokenAccount: operatorTokenAccount,
          operator:            operator.publicKey,
          tokenProgram:        TOKEN_PROGRAM_ID,
        })
        .rpc();
      assert(false, "Debió fallar con NothingToClaim");
    } catch (err: any) {
      const ok = (err.message ?? "").includes("NothingToClaim") ||
                 (err.message ?? "").includes("6005");
      console.log("\n✅ Error esperado:", ok ? "NothingToClaim ✓" : err.message);
      assert(ok);
    }
  });
});