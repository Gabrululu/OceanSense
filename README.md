# 🌊 Ocean-Sense

**DePIN Ocean Monitoring + cPEN Stablecoin for Peru's Coastline**

> A decentralized network of IoT buoys operated by artisanal fishers that records real-time ocean data on Solana, with automatic rewards in **cPEN** — a stablecoin pegged to the Peruvian Sol (PEN).

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana)](https://explorer.solana.com/?cluster=devnet)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-512DA8)](https://anchor-lang.com)
[![Token-2022](https://img.shields.io/badge/Token--2022-Transfer%20Fee-00C853)](https://solana.com/docs/tokens/extensions)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## The Problem

Peru has **3,080 km of coastline** with no real-time ocean data. The lack of reliable information on temperature, currents, and pollution directly affects **40,000 artisanal fishers**.

The 2023–2024 El Niño event caused **$3B in economic losses** because no decentralized monitoring infrastructure existed to enable early warnings.

Current systems (IMARPE, SENAHMI) are centralized, have insufficient coverage, and offer no incentives for community participation.

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
| `mint_cpen`            | USDC → cPEN with collateral              | 1 USDC = 3.80 cPEN  |
| `redeem_cpen`          | cPEN → USDC releasing collateral         | 1 cPEN = 0.263 USDC |
| `claim_reward_as_cpen` | Ocean-Sense rewards directly in cPEN     | CPI with PDA signer |

---

## cPEN Token — Parameters

| Property         | Value                          |
| ---------------- | ------------------------------ |
| Name             | Crypto PEN                     |
| Symbol           | cPEN                           |
| Decimals         | 2                              |
| Peg              | 1 cPEN = 1 Peruvian Sol (PEN)  |
| Collateral       | USDC (1 USDC = 3.80 cPEN)      |
| Standard         | Token-2022                     |
| Transfer Fee     | 0.5% (50 basis points)         |
| Max Fee          | 10,000 cPEN per transaction    |
| Freeze Authority | Yes (SBS/UIF compliance)       |
| Metadata         | Native on-chain (no Metaplex)  |

---

## Rewards Model

| Pollution Level | Description          | USDC      | cPEN equivalent |
| --------------- | -------------------- | --------- | --------------- |
| `0`             | Clean water          | 1.00 USDC | 3.80 S/         |
| `1`             | Mild pollution       | 1.00 USDC | 3.80 S/         |
| `2`             | Moderate pollution   | 2.00 USDC | 7.60 S/         |
| `3`             | Critical pollution 🚨 | 5.00 USDC | 19.00 S/        |

Critical alerts (spills, anomalies) receive **5× more reward** to incentivize urgent reporting.

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
| Smart contracts | Rust + Anchor 0.30.1                                           |
| Token standard  | Token-2022 (SPL)                                               |
| Frontend        | Next.js 14 + TypeScript + Tailwind CSS                         |
| Wallet adapter  | @solana/wallet-adapter (Phantom, Solflare, Backpack, Coinbase) |
| Map             | Leaflet + CartoDB Dark Matter (no API key required)            |
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
│   └── src/
│       ├── hooks/
│       │   └── useOceanSense.ts    ← Full Anchor logic
│       ├── components/
│       │   ├── Providers.tsx       ← Multi-wallet adapter
│       │   ├── Navbar.tsx          ← Navigation + WalletMultiButton
│       │   └── BuoyMap.tsx         ← Leaflet map + CartoDB Dark Matter
│       └── app/
│           ├── page.tsx            ← Dashboard + stats + coastline map
│           ├── reading/page.tsx    ← Register buoy + submit reading
│           ├── claim/page.tsx      ← Claim rewards in cPEN
│           └── cpen/page.tsx       ← Mint / Redeem cPEN ↔ USDC
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
avm install 0.30.1 && avm use 0.30.1

# Clone and setup
git clone https://github.com/YOUR-USERNAME/OceanSense.git
cd OceanSense
yarn install
```

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
  ✔ Submits ocean readings and accumulates rewards
  ✔ Operator claims their 6 accumulated USDC
  ✔ Rejects claim when no USDC is pending

💵 cPEN Token
  ✔ Prepares mints for Devnet
  ✔ Initializes the cPEN configuration
  ✔ Deposits 10 USDC and receives 38 cPEN
  ✔ Burns 19 cPEN and recovers ~5 USDC
  ✔ Claims Ocean-Sense reward directly in cPEN
  ✔ Verifies final state of the cPEN protocol

13 passing
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
| `6008` | `AmountTooSmall`         | Amount too small to convert              |
| `6009` | `InsufficientBalance`    | Insufficient balance in account          |

---

## Environment Variables

```bash
cp .env.example .env
```

| Variable                     | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_PROGRAM_ID`     | Address of the program deployed on Devnet                |
| `NEXT_PUBLIC_CPEN_MINT`      | cPEN mint address (created with setup-cpen-mint.sh)      |
| `NEXT_PUBLIC_USDC_MINT`      | USDC address on Devnet                                   |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | RPC endpoint (default: https://api.devnet.solana.com)    |

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

### 🔜 Post-hackathon

- [ ] On-chain PEN/USD exchange rate oracle
- [ ] Cross-peer validation of anomalous readings
- [ ] Operator staking (skin in the game)
- [ ] Public SDK to integrate Ocean-Sense data
- [ ] Real IoT hardware integration (ESP32 + CTD sensors)

### 🔮 Vision

- [ ] AI-powered fishing zone prediction (on-chain data → off-chain model)
- [ ] Dashboard for PRODUCE, SERNANP, DICAPI, Peruvian Navy
- [ ] Ocean data marketplace for researchers and insurers
- [ ] Expansion to other LATAM coastlines

---

## Built for Solana Frontier Hackathon

> Colosseum × Solana Foundation · 2026

Ocean-Sense is submitted across the **Public Goods** and **University** tracks — a protocol designed to give 40,000 artisanal fishers along Peru's 3,080 km coastline the real-time ocean intelligence they've never had access to.

Built with ❤️ for the Peruvian coast and the fishers who deserve reliable ocean data.
