# OceanSense — IoT Buoy Prototype Specifications

> Version 0.1 · 2026 · Peruvian Coastline

---

## 1. Purpose

The buoy is the physical node of the OceanSense protocol. Its role is to capture oceanographic data in the field, sign each reading with a Solana private key stored in secure hardware, and broadcast the transaction to the network. The operator (artisanal fisher) earns cPEN rewards for every valid reading accepted by the on-chain program.

---

## 2. On-Chain Variables

The Anchor program stores exactly these variables per reading (`OceanReading`):

| On-chain variable | Rust type | Stored unit | Resolution |
|---|---|---|---|
| `temperature` | `i32` | °C × 100 | 0.01 °C |
| `salinity` | `u32` | PSU × 100 | 0.01 PSU |
| `wave_height` | `u32` | meters × 100 | 0.01 m |
| `pollution_level` | `u8` | category 0–3 | discrete |
| `timestamp` | `i64` | Unix epoch (s) | 1 s |

The buoy also records its fixed position at `register_buoy` time:

| Variable | Type | Stored unit |
|---|---|---|
| `latitude` | `i64` | degrees × 100,000 |
| `longitude` | `i64` | degrees × 100,000 |
| `buoy_id` | `String` | max. 32 characters |
| `location_name` | `String` | max. 64 characters |

---

## 3. Required Sensors

### 3.1 Water Temperature
- **Principle**: Submersible RTD (Pt100) or NTC thermistor
- **Range**: −5 °C to +40 °C (Peruvian currents include Humboldt ~14 °C and tropical waters ~28 °C)
- **Minimum accuracy**: ±0.1 °C
- **Deployment**: external submersible probe; buoy body remains at the surface
- **Examples**: waterproof DS18B20 (low-cost, One-Wire) or Atlas Scientific EZO-RTD for higher precision

### 3.2 Salinity / Conductivity
- **Principle**: 4-electrode conductivity (more stable than 2-electrode)
- **Range**: 0 – 45 PSU (open Peruvian ocean ≈ 34–36 PSU)
- **Minimum accuracy**: ±0.1 PSU
- **Drift**: requires quarterly calibration with standard solution
- **Example**: Atlas Scientific EZO-EC (UART/I²C interface, corrosion-resistant)

### 3.3 Wave Height
- **Principle A** (low cost): 6-axis IMU (accelerometer + gyroscope) — double integration of vertical acceleration for displacement
- **Principle B** (high precision): submersed differential pressure sensor correlated to vertical motion
- **Range**: 0 – 10 m (Peruvian coastline average swell: 0.5 – 3 m)
- **Minimum accuracy**: ±0.05 m
- **Sampling rate**: minimum 4 Hz over 20 min to compute Hs (significant wave height)
- **Example A**: ICM-42688-P (high-precision IMU, SPI) · **Example B**: MS5837-30BA (30 bar, I²C)

### 3.4 Pollution Level (0–3)
The contract uses a discrete 4-level scale. The buoy derives it from one or more sensors:

| Sensor | Parameter | Correlation to level |
|---|---|---|
| Optical turbidimeter (NTU) | Turbidity | Slight >10 NTU · Moderate >50 NTU · Critical >200 NTU |
| ORP / Redox sensor | Oxidation-reduction potential | ORP <200 mV indicates organic contamination |
| pH sensor (Atlas EZO-pH) | Acidification | pH <7.5 or >8.5 → alert |
| Fluorometer (chlorophyll) | Algal blooms | Chl-a >50 µg/L → alert |

**For prototype v0**: use turbidimeter + ORP as the minimum criteria. The MCU maps the numeric readings to levels 0–3 before building the transaction.

### 3.5 GPS
- Required for the initial registration (`register_buoy`) and periodic position verification
- **Module**: u-blox NEO-M9N or equivalent (≤2.5 m CEP, low power)
- Position is fixed at registration time; GPS can be powered off afterwards to save energy

---

## 4. Processing Architecture and Solana Signing

The `submit_reading` instruction requires the operator to be a **valid Signer**. This means the buoy must be able to sign ed25519 transactions.

### Recommended topology for the prototype

```
[Sensors] → [Main MCU: ESP32-S3] → [SBC: Raspberry Pi Zero 2W]
                                               ↓
                                    [Secure Element: ATECC608B]
                                    (stores Solana private key)
                                               ↓
                                    [4G LTE Module: SIM7600]
                                               ↓
                                    [Solana RPC Devnet/Mainnet]
```

| Component | Role |
|---|---|
| **ESP32-S3** | Sensor reading via ADC, I²C, SPI, UART. Low power, energy management |
| **Raspberry Pi Zero 2W** | Runs a lightweight Solana client (Node.js / Python) to build and submit transactions |
| **ATECC608B** | Stores the operator's private key in a tamper-proof secure element. Signs via I²C without exposing the key |
| **SIM7600** | 4G Cat-1 module for areas with cellular coverage (Paita, Callao, Ica). Fallback: LoRaWAN to a shore gateway |
| **GPS NEO-M9N** | Initial position fix and GPS timestamp (more reliable than internal clock) |

> **Alternative without SBC**: use a microcontroller with native Ed25519 signing (ESP32 with `ed25519-dalek` via Rust bare-metal). Reduces power consumption but increases firmware complexity.

---

## 5. Power System

Buoys operate at sea without grid power.

| Component | Specification |
|---|---|
| Solar panel | 20 W monocrystalline, splash-resistant |
| LiFePO₄ battery | 40 Ah / 12 V (safe in marine environments, no thermal runaway risk) |
| Charge controller | MPPT 10 A (Victron 75/10 or equivalent) |
| DC/DC converter | 12 V → 5 V / 3.3 V for MCU and SBC |
| Battery life without sun | ≥ 5 days (estimated average draw: 8 W active, 1.5 W standby) |

### Power Budget

| Module | Active current | Sleep mode |
|---|---|---|
| ESP32-S3 + sensors | 280 mA @ 3.3V | 10 µA |
| Raspberry Pi Zero 2W | 300 mA @ 5V | powered off between transmissions |
| SIM7600 (transmission) | 500 mA @ 3.8V (peak) | 1 mA |
| GPS | 25 mA @ 3.3V | powered off after fix |
| **Total during TX** | ~1.1 A average | ~15 mA standby |

Recommended duty cycle: one reading per hour → system active ~3 min/hour → effective average draw ≈ 70 mA. A 20 W panel on the Peruvian coast (4.5 peak sun hours/day) generates 7.5 Ah/day against ~1.7 Ah/day consumed.

---

## 6. Enclosure and Buoyancy

| Aspect | Specification |
|---|---|
| Hull material | HDPE or fiberglass, ≥ 6 mm wall thickness |
| Shape | Spherical Ø 40 cm or cylindrical Ø 30 cm × 60 cm (improved stability) |
| Ballast | Stainless-steel keel weight, metacenter above center of gravity |
| Sealing | IP68: silicone gaskets + SubConn connectors for external sensors |
| Coating | Marine anti-fouling epoxy (prevents biological fouling on sensor surfaces) |
| Mooring | Steel chain + concrete anchor block, line length = 1.5× maximum water depth |
| Signaling | LED flashing light (24 h) + radar reflector, orange flag |

---

## 7. Connectivity and Transmission Protocol

### 7.1 Primary network: 4G LTE
- M2M SIM with a low-volume data plan (~5 MB/month per buoy)
- Each serialized Solana transaction weighs ≈ 1–2 KB
- At one submission per hour: 720 txs/month × 2 KB = ~1.4 MB/month

### 7.2 Backup network: LoRaWAN
For areas without cellular coverage (remote fishing coves), LoRaWAN 915 MHz is used (unlicensed band in Peru):
- The buoy acts as a LoRa node (range ≈ 5–15 km over open sea)
- A shore gateway (Raspberry Pi + RAK831 module) relays the data to a server that signs and submits the Solana transaction
- In this mode, the private key resides in the shore gateway, not in the buoy itself

### 7.3 Data flow

```
Sensors → ESP32 (ADC/I²C) → aggregate and map to on-chain types
        → RPi Zero (build submit_reading instruction)
        → ATECC608B (ed25519 sign)
        → SIM7600 (HTTP POST to Solana RPC)
        → Confirmation ≥ 1 slot (~400 ms)
        → Green confirmation LED on buoy
```

---

## 8. Firmware and Software Stack

| Layer | Technology |
|---|---|
| MCU firmware | C/C++ with ESP-IDF or MicroPython |
| Solana client | Node.js + `@solana/web3.js` on RPi Zero, or Python + `solders` |
| Hardware signing | I²C driver for ATECC608B (`cryptoauthlib`) |
| Watchdog | Automatic reboot if no transaction confirmation within 10 min |
| OTA updates | Firmware updates over cellular (ESP-IDF OTA) |
| Local logging | microSD card: last 30 days of readings (backup during connectivity loss) |

---

## 9. Security

| Threat | Mitigation |
|---|---|
| Private key theft | Key stored in ATECC608B (tamper-proof, non-extractable) |
| Fake readings (spoofing) | On-chain validation: `buoy.owner == operator` — only the registering wallet can submit readings |
| Vandalism / buoy theft | Steel mooring cable + GPS position logging; alert if buoy drifts >500 m |
| Malicious firmware | Verified boot + OTA image signing with manufacturer key |
| Transaction replay | Solana rejects transactions with a repeated nonce (recent blockhash) |

---

## 10. Bill of Materials (key components)

| Component | Description |
|---|---|
| Atlas Scientific EZO-EC | Conductivity / salinity probe |
| Atlas Scientific EZO-RTD | High-precision water temperature probe |
| ICM-42688-P | 6-axis IMU for wave height estimation |
| MS5837-30BA | Pressure sensor (wave height, alternative) |
| u-blox NEO-M9N | GPS module |
| ESP32-S3 | Main MCU — sensor acquisition and power management |
| Raspberry Pi Zero 2W | SBC — Solana transaction builder |
| ATECC608B | Secure element — private key storage and ed25519 signing |
| SIM7600G-H | 4G LTE + GNSS module |
| RAK811 / RAK3172 | LoRaWAN node module (backup connectivity) |
| LiFePO₄ 40 Ah 12V | Marine-grade battery |
| 20 W monocrystalline panel | Solar energy harvesting |
| Victron MPPT 75/10 | Solar charge controller |
| SubConn circular connectors | Underwater-rated cable entry |

---

## 11. Prototype Roadmap

| Phase | Deliverable | Estimated timeline |
|---|---|---|
| **v0.1** | ESP32 + basic sensors (temperature, salinity) on bench, Devnet transactions | 4 weeks |
| **v0.2** | IMU wave height + turbidimeter, ATECC608B integration | +3 weeks |
| **v0.3** | IP68-sealed enclosure, pool / wave-tank testing | +4 weeks |
| **v1.0** | Pilot deployment at sea — 1 buoy at Paita cove, 30 continuous days | +6 weeks |

---

## 12. Applicable Standards and References

- **WMO-No.8**: Guide to Meteorological Instruments and Methods of Observation
- **IEC 60529**: IP rating classification for enclosure sealing
- **IALA Guideline 1018**: Marine aids-to-navigation buoy equipment
- **ITU-R M.1371**: AIS for vessel and buoy identification
- **LoRaWAN 1.0.3 / IEEE 802.15.4**: Low-power wireless communication protocol
