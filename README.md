# 🌊 Ocean-Sense

**DePIN Ocean Monitoring + cPEN Stablecoin for Peru's Coastline**

> A decentralized network of IoT buoys operated by artisanal fishers that records real-time ocean data on Solana, with automatic rewards in **cPEN** — a stablecoin pegged to the Peruvian Sol (PEN).

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana)](https://explorer.solana.com/?cluster=devnet)
[![Anchor](https://img.shields.io/badge/Anchor-0.32.1-512DA8)](https://anchor-lang.com)
[![Token-2022](https://img.shields.io/badge/Token--2022-Transfer%20Fee-00C853)](https://solana.com/docs/tokens/extensions)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## Live on Devnet

| Item              | Value                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Program ID        | [`APbuzcAP5NjhhnqJmEMLX7uEMBRsLHLuZ7rUV9VNsbfx`](https://explorer.solana.com/address/APbuzcAP5NjhhnqJmEMLX7uEMBRsLHLuZ7rUV9VNsbfx?cluster=devnet) |
| cPEN mint         | [`3LJLwnKYh3PeM2kqVqevGA6HAjrHQHBnpgHLXyh7oWJj`](https://explorer.solana.com/address/3LJLwnKYh3PeM2kqVqevGA6HAjrHQHBnpgHLXyh7oWJj?cluster=devnet) |
| USDC mint (mock)  | [`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`](https://explorer.solana.com/address/4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU?cluster=devnet) |
| Buoy `LIMA-001`   | Registered and live — first reading claimed as cPEN                                               |
| USDC vault        | [`BnqPn6dfNfLeSScDAPCiv7KoF4UFco4zSjsURpHBdvJj`](https://explorer.solana.com/address/BnqPn6dfNfLeSScDAPCiv7KoF4UFco4zSjsURpHBdvJj?cluster=devnet) — funds institutional "subscriptions" from [`/data`](#data-access--monetization) |

This is a fresh redeploy (24 ago 2026). An earlier program (`EawytSi...`) is orphaned — its upgrade authority keypair wasn't available in the environment this was deployed from, so rather than upgrade in place, the program was redeployed from scratch under a new wallet, with the cooldown/reward-tier/rate changes below already baked into the deployed binary (verified live on-chain, not just in source).

---

## The Problem

Peru has **3,080 km of coastline** with no real-time ocean data. The lack of reliable information on temperature, currents, and pollution directly affects **77,326 artisanal fishers** (IMARPE ENEPA IV, 2022–2023).

The 2023–2024 El Niño event caused **$3B in economic losses** because no decentralized monitoring infrastructure existed to enable early warnings.

Current systems (IMARPE, SENAMHI) are centralized, have insufficient coverage, and offer no incentives for community participation.

---

## The Solution

Ocean-Sense combines **DePIN + a local stablecoin** in a single protocol:

1. Fishers operate IoT buoys in their fishing zones
2. Buoys submit ocean readings to Solana via transactions
3. The on-chain program validates and immutably records each reading
4. Operators receive **cPEN** (Crypto PEN, pegged to the Peruvian Sol) for every valid data point
5. Critical pollution alerts are emitted in real time on-chain

---

## Protocol Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              SOLANA DEVNET                               │
│                                                                          │
│  ┌──────────────┐   ┌───────────────┐     ┌──────────────────────────┐   │
│  │  BuoyState   │──▶│ OceanReading  │     │       VaultState         │   │
│  │     PDA      │   │     PDA       │     │          PDA             │   │
│  │              │   │               │     │                          │   │
│  │ buoy_id      │   │ temperature   │     │ authority                │   │
│  │ latitude     │   │ salinity      │     │ usdc_mint                │   │
│  │ longitude    │   │ wave_height   │     │ total_funded             │   │
│  │ is_active    │   │ pollution_lvl │     │ total_paid               │   │
│  │ unclaimed    │   │ usdc_reward   │     │                          │   │
│  │ total_rwrds  │   │ claimed       │     │                          │   │
│  └──────────────┘   └───────────────┘     └────────────┬─────────────┘   │
│                                                        │ CPI             │
│  ┌──────────────────────────────────┐     ┌────────────▼─────────────┐   │
│  │           cPEN Token             │     │    CpenMintConfig        │   │
│  │           Token-2022             │     │          PDA             │   │
│  │                                  │     │                          │   │
│  │  Transfer Fee : 0.5% (50 bps)    │     │ cpen_mint                │   │
│  │  Metadata    : native on-chain   │     │ usdc_mint                │   │
│  │  Freeze Auth : SBS compliance    │     │ total_minted             │   │
│  │  MintClose   : controlled close  │     │ total_redeemed           │   │
│  └──────────────────────────────────┘     └──────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## On-Chain Instructions

### Main module (`lib.rs`)

| Instruction        | Description                                        | Key Accounts                     |
| ------------------ | -------------------------------------------------- | -------------------------------- |
| `register_buoy`    | Registers a buoy with GPS coordinates              | BuoyState PDA, Operator          |
| `submit_reading`   | Submits an ocean reading and accrues USDC          | BuoyState, OceanReading PDA      |
| `toggle_buoy`      | Activates / deactivates a buoy                     | BuoyState, Operator              |
| `initialize_vault` | Creates the global USDC vault                      | VaultState PDA, TokenAccount PDA |
| `fund_vault`       | Deposits USDC into the vault (CPI)                 | VaultState, Funder ATA           |
| `claim_reward`     | Transfers USDC to the operator (PDA-signed CPI)    | VaultState, Operator ATA         |

### cPEN module (`cpen.rs`)

| Instruction            | Description                              | Rate                |
| ---------------------- | ---------------------------------------- | ------------------- |
| `initialize_cpen_mint` | Creates the mint config and collateral vault | —               |
| `mint_cpen`            | USDC → cPEN with collateral              | 1 USDC = 3.36 cPEN  |
| `redeem_cpen`          | cPEN → USDC releasing collateral         | 1 cPEN = 0.298 USDC |
| `claim_reward_as_cpen` | Ocean-Sense rewards directly in cPEN     | CPI with PDA signer |

---

## cPEN Token — Parameters

| Property         | Value                          |
| ---------------- | ------------------------------ |
| Name             | Crypto PEN                     |
| Symbol           | cPEN                           |
| Decimals         | 2                              |
| Peg              | 1 cPEN = 1 Peruvian Sol (PEN)  |
| Collateral       | USDC (1 USDC = 3.36 cPEN — tasa de mercado, actualizada 24 ago 2026) |
| Standard         | Token-2022                     |
| Transfer Fee     | 0.5% (50 basis points)         |
| Max Fee          | 10,000 cPEN per transaction    |
| Freeze Authority | Yes (SBS/UIF compliance)       |
| Metadata         | Native on-chain (no Metaplex)  |

---

## Rewards Model

| Pollution Level | Description           | USDC      | cPEN equivalent           |
| --------------- | --------------------- | --------- | ------------------------- |
| `0`             | Clean water           | 0.20 USDC | `0.2 × rate` S/           |
| `1`             | Mild pollution        | 0.30 USDC | `0.3 × rate` S/           |
| `2`             | Moderate pollution    | 0.75 USDC | `0.75 × rate` S/          |
| `3`             | Critical pollution 🚨  | 2.00 USDC | `2 × rate` S/             |

`rate` = live USD/PEN exchange rate fetched from open.er-api.com (updated every hour in the UI). Critical alerts (spills, anomalies) receive **10× the base reward** to incentivize urgent reporting.

**Anti-spam cooldown:** a buoy can only submit one rewarded reading per hour, enforced on-chain against the Solana runtime clock (not the client-supplied timestamp, which can't be trusted for this check). Without this, `submit_reading` had no rate limit and could be called in a loop to farm rewards — Solana transaction fees are a fraction of a cent, far below the old 1.00–5.00 USDC per call.

**Welcome bonus:** a buoy's first-ever reading earns an extra one-time 1.00 USDC, to reward the effort of onboarding a new operator without adding a recurring cost.

---

## Data Access & Monetization

Raw readings are public and free by construction — they live in permissionless PDAs anyone can read via RPC, so they can't be paywalled. The [`/data`](app/src/app/data/page.tsx) page demonstrates the layer that's actually monetized: aggregation, historical export, and real-time delivery, sold as institutional subscriptions to the buyers named in the roadmap (PRODUCE, SERNANP, DICAPI, the Navy, insurers, researchers).

There's no separate billing system. An institutional "subscription" is a real `fund_vault()` call — the same USDC vault instructions from the on-chain program (`initialize_vault` → `fund_vault` → `claim_reward`, previously dormant, now initialized — see [ARCHITECTURE.md §2](ARCHITECTURE.md)) that operators can withdraw from. Subscription revenue and fisher payouts share one pool by construction, not by policy.

- **[`/data`](app/src/app/data/page.tsx)** — pricing tiers (illustrative), a live "Fund the Vault" panel that submits a real Devnet `fund_vault` transaction, live vault stats (`totalFunded`/`totalPaid`), and a runnable demo of the API below.
- **[`/api/v1/readings`](app/src/app/api/v1/readings/route.ts)** — a working, unauthenticated JSON endpoint that aggregates on-chain buoys + readings server-side. This is the actual shape of the paid product; a production deployment would gate/meter it per tier instead of leaving it open.

---

## Ocean Data Recorded On-Chain

| Parameter      | Rust Type | On-chain unit   | Example            |
| -------------- | --------- | --------------- | ------------------ |
| Temperature    | `i32`     | hundredths °C   | `2250` = 22.50°C   |
| Salinity       | `u32`     | hundredths PSU  | `3510` = 35.10 PSU |
| Wave height    | `u32`     | centimeters     | `85` = 0.85 m      |
| Pollution      | `u8`      | level 0–3       | `3` = critical     |
| Timestamp      | `i64`     | Unix timestamp  | IoT sensor         |

> Scaled integers avoid float precision issues in on-chain programs — standard practice in Solana.

---

## Tech Stack

| Layer           | Technology                                                     |
| --------------- | -------------------------------------------------------------- |
| Blockchain      | Solana Devnet                                                  |
| Smart contracts | Rust + Anchor 0.32.1                                           |
| Token standard  | Token-2022 (SPL)                                               |
| Frontend        | Next.js 14 + TypeScript + Tailwind CSS                         |
| Wallet adapter  | @solana/wallet-adapter (Phantom, Solflare, Backpack, Coinbase) |
| Map             | Leaflet + CartoDB Dark Matter (no API key required)            |
| Exchange rate   | open.er-api.com (live USD/PEN, cached 1h, no API key)          |
| SDK             | `@oceansense/sdk` — framework-agnostic TypeScript client       |
| IoT Gateway     | Node.js HTTP server — ESP32 → Solana bridge                    |
| Dev environment | GitHub Codespaces + devcontainer                               |

---

## Repository Structure

```
OceanSense/
│
├── programs/
│   └── ocean-sense-pay/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs              ← Main program (buoys, readings, vault)
│           └── cpen.rs             ← cPEN Token-2022
│
├── tests/
│   ├── anchor.test.ts              ← Vault + USDC claim tests
│   └── anchor.test.day2.ts         ← cPEN mint/redeem/claim tests
│
├── app/                            ← Next.js frontend
│   ├── public/
│   │   └── idl/
│   │       └── ocean_sense_pay.json  ← Anchor IDL served statically
│   └── src/
│       ├── hooks/
│       │   ├── useOceanSense.ts    ← Full Anchor logic + wallet state
│       │   └── useExchangeRate.ts  ← Live USD/PEN rate (open.er-api.com, 1h cache)
│       ├── components/
│       │   ├── Providers.tsx       ← Multi-wallet adapter
│       │   ├── Navbar.tsx          ← Navigation + WalletMultiButton
│       │   └── BuoyMap.tsx         ← Leaflet map + CartoDB Dark Matter
│       └── app/
│           ├── page.tsx            ← Dashboard + stats + coastline map
│           ├── reading/page.tsx    ← Register buoy + submit reading
│           ├── claim/page.tsx      ← Claim rewards in cPEN
│           ├── cpen/page.tsx       ← Mint / Redeem cPEN ↔ USDC
│           ├── data/page.tsx       ← Institutional data access + fund_vault subscriptions
│           └── api/v1/readings/    ← Read-only JSON API (aggregated buoys + readings)
│
├── sdk/                            ← @oceansense/sdk
│   ├── src/
│   │   ├── client.ts               ← OceanSenseClient (framework-agnostic)
│   │   ├── types.ts                ← BuoyData, CpenStats, param interfaces
│   │   └── index.ts                ← Barrel export
│   ├── package.json
│   └── tsconfig.json
│
├── gateway/                        ← IoT HTTP Gateway (ESP32 → Solana)
│   ├── index.ts                    ← HTTP server: /register /reading /buoys /health
│   └── package.json
│
├── scripts/
│   ├── setup-cpen-mint.sh          ← Create Token-2022 mint with extensions
│   └── setup-frontend.sh           ← Install Next.js and dependencies
│
├── metadata/
│   └── cpen.json                   ← On-chain token metadata
│
├── .devcontainer/
│   ├── devcontainer.json           ← Codespace config
│   └── setup.sh                    ← Auto-installs Solana + Anchor
│
├── BUOY_SPEC.md                    ← IoT buoy hardware prototype specifications
├── ARCHITECTURE.md                 ← Technical architecture: PDAs, accounts, instruction flow
├── deck.md                         ← Pitch deck outline (slide-by-slide)
├── pitch.md                        ← Project narrative: problem, solution, why now, why Solana
├── brandkit.md                     ← Visual identity: colors, typography, logo, voice & tone
├── Anchor.toml
├── Cargo.toml
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

---

## Quickstart on GitHub Codespace

### Option A — Open in Codespace (recommended)

1. Click **Code → Codespaces → Create codespace on main**
2. Wait ~3 min while `setup.sh` installs everything automatically
3. Verify installation:

```bash
solana --version
anchor --version
```

### Option B — Local

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.32.1 && avm use 0.32.1

# Clone and setup
git clone https://github.com/YOUR-USERNAME/OceanSense.git
cd OceanSense
yarn install
```

> **Windows-native notes:** the Codespace/Linux path above is the recommended one — Windows-native Anchor/Solana toolchain setup hit several env-specific issues in practice: `cargo-build-sbf` from Solana CLI v4.2.1 loops on a false-positive "corrupted toolchain" error on Windows (fixed by installing CLI **v2.1.21** instead: `agave-install init 2.1.21`); rustup's `solana` toolchain can end up with empty `bin`/`lib` dirs due to a symlink-permission issue in the installer's linking step (fixed with `rustup toolchain uninstall solana` then `rustup toolchain link solana "<path-to-platform-tools>/rust"`, pointing at the already-downloaded platform-tools instead of re-copying them); and building without a committed `Cargo.lock` can pull in `edition2024` transitive dependencies the SBF-bundled cargo can't parse — see the explicit version pins with inline comments in [`programs/ocean-sense-pay/Cargo.toml`](programs/ocean-sense-pay/Cargo.toml) if new `edition2024` errors show up after a `cargo update`.

---

## Deploy on Devnet

```bash
# 1. Set network
solana config set --url devnet

# 2. Generate wallet (if you don't have one)
solana-keygen new --no-bip39-passphrase

# 3. Fund with test SOL
solana airdrop 5
# Or use: https://faucet.solana.com

# 4. Build and copy IDL to frontend
yarn build

# 5. Deploy
anchor deploy

# 6. Update .env with deploy addresses
cp .env.example .env
# Edit PROGRAM_ID, CPEN_MINT and their NEXT_PUBLIC_* variants

# 7. Run tests
anchor test
```

---

## Running the Frontend

```bash
cd app
npm install
npm run dev
# → http://localhost:3000
```

### Available pages

| Route      | Description                                              |
| ---------- | -------------------------------------------------------- |
| `/`        | Dashboard with coastline map + network statistics        |
| `/reading` | Register a new buoy or submit an ocean reading           |
| `/claim`   | View and claim pending rewards in cPEN                   |
| `/cpen`    | Convert USDC ↔ cPEN and check balances                   |
| `/data`    | Data access pricing tiers + institutional `fund_vault` subscriptions |

---

## Tests

```bash
# All tests
anchor test

# Vault + USDC claim only
yarn run ts-mocha -p ./tsconfig.json tests/anchor.test.ts

# cPEN mint/redeem only
yarn run ts-mocha -p ./tsconfig.json tests/anchor.test.day2.ts
```

Expected output:

```
🌊 Ocean-Sense
  ✔ Creates mock USDC for Devnet
  ✔ Initializes the global USDC vault
  ✔ Funds the vault with 100 USDC
  ✔ Registers the buoy on the Peruvian coastline
  ✔ Submits an ocean reading and accrues a reward (with welcome bonus)
  ✔ Rejects a second reading before 1h (cooldown)
  ✔ Operator claims their accumulated USDC
  ✔ Rejects claim when no USDC is pending

💵 cPEN Token
  ✔ Prepares mints for Devnet
  ✔ Initializes the cPEN configuration
  ✔ Deposits 10 USDC and receives 33.60 cPEN
  ✔ Burns 19 cPEN and recovers ~5.65 USDC
  ✔ Claims Ocean-Sense reward directly in cPEN
  ✔ Verifies final state of the cPEN protocol

14 passing
```

---

## Custom Errors

| Code   | Name                     | Description                              |
| ------ | ------------------------ | ---------------------------------------- |
| `6000` | `StringTooLong`          | String exceeds maximum size              |
| `6001` | `InvalidPollutionLevel`  | Pollution level must be 0–3              |
| `6002` | `BuoyNotActive`          | Buoy is deactivated, readings rejected   |
| `6003` | `Unauthorized`           | Only the owner operator can execute      |
| `6004` | `Overflow`               | Arithmetic overflow in counters          |
| `6005` | `NothingToClaim`         | No pending rewards                       |
| `6006` | `InsufficientVaultFunds` | Vault has insufficient funds             |
| `6007` | `InvalidAmount`          | Invalid or zero amount                   |
| `6008` | `ReadingTooSoon`         | Must wait 1h between readings on a buoy  |
| `6008` | `AmountTooSmall`         | Amount too small to convert (separate `CpenError` enum, same code number) |
| `6009` | `InsufficientBalance`    | Insufficient balance in account          |

---

## Environment Variables

```bash
cp .env.example .env
```

### Frontend (`app/.env.local`)

| Variable                     | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_PROGRAM_ID`     | Address of the program deployed on Devnet                |
| `NEXT_PUBLIC_CPEN_MINT`      | cPEN mint address (created with setup-cpen-mint.sh)      |
| `NEXT_PUBLIC_USDC_MINT`      | USDC address on Devnet                                   |
| `NEXT_PUBLIC_RPC_URL`        | RPC endpoint (default: https://api.devnet.solana.com)    |

### IoT Gateway

| Variable       | Description                                               | Default                              |
| -------------- | --------------------------------------------------------- | ------------------------------------ |
| `PORT`         | HTTP port the gateway listens on                          | `3001`                               |
| `RPC_URL`      | Solana RPC endpoint                                       | `https://api.devnet.solana.com`      |
| `KEYPAIR_PATH` | Path to the operator's Solana keypair JSON file           | `~/.config/solana/id.json`           |
| `NEXT_PUBLIC_CPEN_MINT` | cPEN mint address (enables cPEN reward claiming) | —                                    |

---

## @oceansense/sdk

A framework-agnostic TypeScript client for the OceanSense on-chain program. Works in Node.js, browser, and any React/Vue/Svelte project.

```typescript
import { OceanSenseClient } from "./sdk/src/index.js";
import { Connection, Keypair } from "@solana/web3.js";

const client = new OceanSenseClient({
  connection: new Connection("https://api.devnet.solana.com"),
  keypair: Keypair.fromSecretKey(/* your key */),
});

// Register a buoy
await client.registerBuoy({
  buoyId: "PAITA-001",
  latDeg: -5.0623,
  lngDeg: -81.43,
  locationName: "Boya Paita Norte",
});

// Submit a reading
await client.submitReading({
  buoyId: "PAITA-001",
  temperature: 22.5,    // °C
  salinity: 35.1,       // PSU
  waveHeight: 0.85,     // meters
  pollutionLevel: 0,    // 0–3
});

// Fetch all registered buoys
const buoys = await client.fetchBuoys();
```

The IDL is embedded in the client — no external files required.

---

## IoT Gateway

HTTP bridge between ESP32 buoys and the Solana network. The gateway loads the operator keypair and signs transactions on behalf of the buoy.

```bash
# Start the gateway
KEYPAIR_PATH=~/.config/solana/id.json yarn gateway

# Hot-reload during development
yarn gateway:dev
```

### ESP32 Arduino example

```cpp
HTTPClient http;
http.begin("http://<gateway-ip>:3001/reading");
http.addHeader("Content-Type", "application/json");

String body = "{\"buoyId\":\"PAITA-001\","
  "\"temperature\":22.5,\"salinity\":35.1,"
  "\"waveHeight\":0.85,\"pollutionLevel\":0}";

int code = http.POST(body);
// Response: {"signature":"abc123...","reward_usdc":1,"explorer":"https://..."}
```

### Endpoints

| Method | Route        | Description                                   |
| ------ | ------------ | --------------------------------------------- |
| POST   | `/reading`   | Submit sensor data → Solana transaction        |
| POST   | `/register`  | Register a new buoy on-chain                  |
| GET    | `/buoys`     | Return all registered buoys                   |
| GET    | `/health`    | Gateway status + operator public key          |

---

## Why Solana?

| Criterion     | Why it matters for Ocean-Sense                                                      |
| ------------- | ----------------------------------------------------------------------------------- |
| Fees < $0.001 | Fishers submit readings every hour — high fees would make the model unviable        |
| Sub-second    | Pollution alerts must arrive in seconds, not minutes                                |
| Token-2022    | Native Transfer Fee + Freeze Authority for compliance without extra code            |
| DePIN leader  | Solana is the leading DePIN ecosystem (Helium, Hivemapper, GEODNET)                 |
| Composable    | Other protocols can read Ocean-Sense data permissionlessly                          |

---

## Roadmap

### ✅ Frontier Hackathon

- [x] On-chain buoy registration with PDAs
- [x] Immutable ocean readings with pollution alerts
- [x] USDC vault + reward claiming via CPI
- [x] cPEN token with Token-2022 (Transfer Fee + Metadata + Freeze)
- [x] cPEN ↔ USDC mint/redeem with collateral vault
- [x] Next.js frontend: dashboard, CartoDB map, claim, swap
- [x] Multi-wallet support (Phantom, Solflare, Backpack, Coinbase)
- [x] Full TypeScript test suite
- [x] Live USD/PEN exchange rate (`useExchangeRate` — open.er-api.com, 1h cache)
- [x] `@oceansense/sdk` — framework-agnostic TypeScript client
- [x] IoT Gateway — ESP32 → HTTP → Solana transaction bridge
- [x] `BUOY_SPEC.md` — full hardware prototype specification
- [x] Data access/monetization demo — institutional `fund_vault` subscriptions + read-only `/api/v1/readings`
- [x] `@oceansense/sdk` vault parity — `initializeVault`/`fundVault`/`claimReward` available outside the app, not just in `useOceanSense.ts`

### 🔜 Post-hackathon

- [ ] Gate `/api/v1` behind an API key with real per-tier metering/billing — currently open for the demo; needs a decision on where subscription state lives (KV/DB vs. a simple env-var allowlist) before it can be built
- [ ] On-chain PEN/USD exchange rate oracle (Pyth / Switchboard)
- [ ] Cross-peer validation of anomalous readings
- [ ] Operator staking (skin in the game)
- [ ] Physical buoy v0.1 deployment off the coast of Lima

### 🔮 Vision

- [ ] AI-powered fishing zone prediction (on-chain data → off-chain model)
- [ ] Dashboard for PRODUCE, SERNANP, DICAPI, Peruvian Navy
- [ ] Ocean data marketplace for researchers and insurers
- [ ] Expansion to other LATAM coastlines

---

## Built for Solana Frontier Hackathon

> Colosseum × Solana Foundation · 2026

Ocean-Sense is submitted across the **Public Goods** and **University** tracks — a protocol designed to give 77,326 artisanal fishers along Peru's 3,080 km coastline the real-time ocean intelligence they've never had access to.

Built with ❤️ for the Peruvian coast and the fishers who deserve reliable ocean data.
