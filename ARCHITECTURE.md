# Ocean-Sense — Technical Architecture

This document describes the on-chain program's accounts, PDAs, and instruction flows in more depth than the README's summary tables. It exists because the protocol actually has **two independent, parallel reward paths** — only one of which the frontend uses — and that split isn't obvious from reading the UI alone.

---

## 1. Two reward paths

Ocean-Sense pays operators for valid ocean readings in one of two ways, both driven by the same `submit_reading` accrual:

| Path | Instructions | Currency paid out | Used by the current frontend? |
| ---- | ------------ | ------------------ | ------------------------------ |
| **cPEN path** | `initialize_cpen_mint` → `claim_reward_as_cpen` | cPEN (Token-2022, minted on demand) | **Yes** — this is the only path [`app/src/app/claim/page.tsx`](app/src/app/claim/page.tsx) calls |
| **Raw-USDC path** | `initialize_vault` → `fund_vault` → `claim_reward` | Real USDC, from a program-owned vault | **Yes** — [`/data`](app/src/app/data/page.tsx) funds it (institutional "subscriptions"), [`/claim`](app/src/app/claim/page.tsx) lets operators withdraw from it (see §2 below) |

Both paths read from the same `unclaimed_usdc` counter on `BuoyState` (see §3) — `submit_reading` doesn't know or care which claim path will eventually zero it out. A buoy could in principle be claimed via either path (whichever runs first wins, since both zero the same counter), though in practice only the cPEN path is reachable today.

---

## 2. The raw-USDC path — now the institutional-subscription mechanism

The raw-USDC path is the more "traditional" DePIN payout model: a treasury funds a vault with real USDC, and operators withdraw directly from it. It's simpler to reason about than the cPEN path (no minting, no peg, no collateral ratio) and it's what `tests/anchor.test.ts` exercises. It sat dormant for most of this project's history — `initialize_vault` had never been run — until it was activated as the literal funding mechanism for [`/data`](app/src/app/data/page.tsx)'s institutional subscriptions: rather than building a separate billing system, "an institution subscribes" **is** a real `fund_vault()` call, and that USDC lands in the exact same vault operators would withdraw from.

1. **`initialize_vault`** — called once by the deploy/authority wallet. Creates:
   - `VaultState` PDA at seeds `["vault_state", usdc_mint]` — holds `authority`, `usdc_mint`, `total_funded`, `total_paid`.
   - `vault_token_account`, an SPL token account at seeds `["vault_token", usdc_mint]`, owned by the `VaultState` PDA (so the PDA can sign transfers out of it later).

   **Now run** against the current program (`APbuzcAP5NjhhnqJmEMLX7uEMBRsLHLuZ7rUV9VNsbfx`), for USDC mint `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` — see the "Live on Devnet" table in [README.md](README.md) for the resulting PDA addresses.

2. **`fund_vault`** — anyone with USDC deposits into `vault_token_account` via a CPI transfer, incrementing `total_funded`. Repeatable, no cap. This is what [`useOceanSense.ts`](app/src/hooks/useOceanSense.ts)'s `fundVault()` calls, and what the "Fund the Vault" panel on `/data` triggers from a connected wallet — a working, on-chain "subscription," not a mockup.

3. **`claim_reward`** — an operator calls this against their own buoy. It checks `buoy.unclaimed_usdc > 0`, checks `vault_token_account.amount >= amount_to_pay` (fails with `InsufficientVaultFunds` if the vault is underfunded — [`useOceanSense.ts`](app/src/hooks/useOceanSense.ts)'s `friendlyError()` translates that into a plain-language message pointing at the cPEN alternative), then transfers `unclaimed_usdc` out to the operator's USDC token account, signed by the `VaultState` PDA (via its stored bump), and zeroes `buoy.unclaimed_usdc`. Wired into `/claim` as a second per-buoy button (USDC) next to the existing cPEN one — both draw from the same `unclaimed_usdc`, so claiming via either path zeroes it out; whichever the operator picks is final for that accrual.

The `@oceansense/sdk` package doesn't wrap this path either — [`sdk/src/client.ts`](sdk/src/client.ts) only implements `registerBuoy`, `submitReading`, and `claimRewardAsCpen`. Standing this path up for real use would mean: run `initialize_vault` once, `fund_vault` with an actual USDC treasury balance, then add `claimReward` (raw variant) to the SDK/UI as an alternative to the cPEN claim button — a deliberate product decision (do we want two competing claim paths visible to users?), not just a missing line of code.

---

## 3. Accounts and PDAs

| Account | Seeds | Holds |
| ------- | ----- | ----- |
| `BuoyState` | `["buoy", buoy_id, owner]` | Registration + accrual state: `owner`, `buoy_id`, lat/lng, `is_active`, `total_readings`, `total_rewards`, `unclaimed_usdc`, `last_reading_timestamp` (on-chain clock value, used for the cooldown check), `bump` |
| `OceanReading` | `["reading", buoy, reading_index_le_bytes]` | One immutable record per submitted reading: temperature, salinity, wave height, pollution level, `usdc_reward` accrued by that specific reading, `claimed` |
| `VaultState` *(institutional-subscription vault, §2)* | `["vault_state", usdc_mint]` | `authority`, `usdc_mint`, `total_funded`, `total_paid`, `vault_bump` |
| `vault_token_account` *(institutional-subscription vault, §2)* | `["vault_token", usdc_mint]` | SPL token account custodying the vault's USDC, owned by `VaultState` |
| `CpenMintConfig` | `["mint_config", usdc_mint]` | `authority`, `cpen_mint`, `usdc_mint`, `total_minted`, `total_redeemed`, `total_fees_collected`, `bump` |
| `usdc_collateral_vault` | `["usdc_collateral", usdc_mint]` | SPL token account holding the USDC collateral backing minted cPEN, owned by `CpenMintConfig` |

Note that `VaultState` and `CpenMintConfig` are both seeded off the same `usdc_mint` but with different string prefixes (`"vault_state"` vs `"mint_config"`), so they resolve to different addresses and don't collide — they're genuinely independent, coexistable subsystems.

---

## 4. Instruction flow — the path actually in use

```
register_buoy(buoy_id, lat, lng, name)
        │
        ▼
submit_reading(temp, salinity, wave_height, pollution_level, timestamp)
   │  • cooldown check: now − buoy.last_reading_timestamp ≥ 3600s (skipped on first-ever reading)
   │  • base_reward by pollution_level: 0→0.20, 1→0.30, 2→0.75, 3→2.00 USDC
   │  • + 1.00 USDC welcome bonus if this is the buoy's first reading
   │  • buoy.unclaimed_usdc += (base_reward + welcome_bonus)
   │  • buoy.last_reading_timestamp = on-chain clock now
   │  • pollution_level == 3 also emits a PollutionAlert event
        │
        ▼
claim_reward_as_cpen()
   • reads buoy.unclaimed_usdc (accrued in USDC-denominated units)
   • mints cpen = unclaimed_usdc × USDC_TO_CPEN_RATE(336) / 1_000_000 to the operator's cPEN ATA
   • zeroes buoy.unclaimed_usdc
```

`mint_cpen` / `redeem_cpen` are the separate USDC↔cPEN swap instructions users hit from the `/cpen` page — unrelated to reward accrual, they just move collateral in and out of `usdc_collateral_vault` at the same `USDC_TO_CPEN_RATE`.

---

## 5. Deployed addresses (Devnet)

See the [README's "Live on Devnet" section](README.md#live-on-devnet) for the current program ID, cPEN mint, and USDC mint — kept there rather than duplicated here so there's a single source of truth to update after any future redeploy.

---

## 6. Frontend integration

- The Anchor IDL is hand-maintained at [`app/public/idl/ocean_sense_pay.json`](app/public/idl/ocean_sense_pay.json) (legacy 0.29-format IDL, since `anchor build`'s auto-generated IDL was never committed) and fetched client-side by [`useOceanSense.ts`](app/src/hooks/useOceanSense.ts), which wraps every instruction call, wallet state, and a `friendlyError()` translator for common failure modes (insufficient funds, cooldown not elapsed, wallet rejected, etc).
- `useOceanSense.ts` builds its Anchor `Program` with a read-only fallback wallet (`readOnlyWallet`, a throwaway `Keypair` that never signs) when no real wallet is connected, so public reads (`fetchBuoys`, `fetchVaultStats`) work for any visitor — write actions still separately gate on `wallet.publicKey` being a real connected wallet.
- `sdk/src/client.ts` embeds its own copy of the IDL (only the subset of instructions/accounts/errors it wraps) rather than importing the app's — the two are meant to stay in sync manually since the SDK is meant to be usable outside this repo.

---

## 7. Data access layer (`/data`)

[`app/src/app/data/page.tsx`](app/src/app/data/page.tsx) is the demo of the monetization model: raw readings stay public and free (see §1), and what's actually sold is the aggregation/reliability layer on top.

- **Institutional "subscriptions"** are real `fund_vault()` calls (§2) — no separate billing system, no off-chain database. The page shows live `VaultState` totals (`totalFunded`/`totalPaid`) so the funding loop is directly observable, not just narrated.
- **[`app/src/app/api/v1/readings/route.ts`](app/src/app/api/v1/readings/route.ts)** is a Next.js Route Handler that server-side-joins `buoyState.all()` + `oceanReading.all()` into clean JSON — this is the actual shape of "the paid product." It's left open (no API key) for the demo; a real deployment would gate/meter it per the pricing tier, which the page's copy states explicitly rather than pretending it's already enforced. It only returns readings from buoys with `isActive == true` — a deactivated buoy (see `toggle_buoy` in §4) can carry stale or wrong registration data (e.g. bad coordinates) that shouldn't be presented as current, even though the on-chain reading itself is real and immutable. Raw RPC access to the same PDAs (the free tier) has no such filter — that distinction is deliberate: the free tier is unfiltered ground truth, this endpoint is the curated product.
- Pricing tiers on the page are illustrative placeholders, not a researched pricing model.
