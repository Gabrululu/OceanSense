# 🌊 Ocean-Sense

**DePIN de Monitoreo Oceánico + Stablecoin cPEN para el Litoral Peruano**

> Red descentralizada de boyas IoT operadas por pescadores artesanales que registran datos oceánicos en tiempo real en Solana, con recompensas automáticas en **cPEN** — una stablecoin pegged al Sol Peruano (PEN).

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana)](https://explorer.solana.com/?cluster=devnet)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-512DA8)](https://anchor-lang.com)
[![Token-2022](https://img.shields.io/badge/Token--2022-Transfer%20Fee-00C853)](https://solana.com/docs/tokens/extensions)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## El Problema

Perú tiene **3,080 km de costa** sin datos oceánicos en tiempo real. La ausencia de información confiable sobre temperatura, corrientes y contaminación impacta directamente a **40,000 pescadores artesanales**.

El Niño 2023–2024 causó **$3B en pérdidas económicas** porque no existía infraestructura de monitoreo descentralizada que permitiera alertas tempranas.

Los sistemas actuales son centralizados (IMARPE, SENAHMI), con cobertura insuficiente y sin incentivos para la participación comunitaria.

---

## La Solución

Ocean-Sense combina **DePIN + stablecoin local** en un solo protocolo:

1. Pescadores operan boyas IoT en sus zonas de pesca
2. Las boyas envían lecturas oceánicas a Solana vía transacciones
3. El programa on-chain valida y registra cada lectura de forma inmutable
4. Los operadores reciben **cPEN** (crypto PEN, pegged al Sol Peruano) por cada dato válido
5. Las alertas de contaminación crítica se emiten en tiempo real on-chain

---

## Arquitectura del Protocolo

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
│  │           Token cPEN             │     │    CpenMintConfig        │   │
│  │           Token-2022             │     │          PDA             │   │
│  │                                  │     │                          │   │
│  │  Transfer Fee : 0.5% (50 bps)    │     │ cpen_mint                │   │
│  │  Metadata    : on-chain nativa   │     │ usdc_mint                │   │
│  │  Freeze Auth : compliance SBS    │     │ total_minted             │   │
│  │  MintClose   : cierre controlado │     │ total_redeemed           │   │
│  └──────────────────────────────────┘     └──────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Instrucciones On-Chain

### Módulo principal (`lib.rs`)

| Instrucción        | Descripción                                       | Accounts clave                   |
| ------------------ | ------------------------------------------------- | -------------------------------- |
| `register_buoy`    | Registra boya con coordenadas GPS                 | BuoyState PDA, Operator          |
| `submit_reading`   | Envía lectura oceánica y acumula USDC             | BuoyState, OceanReading PDA      |
| `toggle_buoy`      | Activa / desactiva boya                           | BuoyState, Operator              |
| `initialize_vault` | Crea vault global de USDC                         | VaultState PDA, TokenAccount PDA |
| `fund_vault`       | Deposita USDC al vault (CPI)                      | VaultState, Funder ATA           |
| `claim_reward`     | Transfiere USDC al operador (CPI firmado por PDA) | VaultState, Operator ATA         |

### Módulo cPEN (`cpen.rs`)

| Instrucción            | Descripción                             | Conversión          |
| ---------------------- | --------------------------------------- | ------------------- |
| `initialize_cpen_mint` | Crea el mint config y vault colateral   | —                   |
| `mint_cpen`            | USDC → cPEN con colateral               | 1 USDC = 3.80 cPEN  |
| `redeem_cpen`          | cPEN → USDC liberando colateral         | 1 cPEN = 0.263 USDC |
| `claim_reward_as_cpen` | Recompensas Ocean-Sense en cPEN directo | CPI con firma PDA   |

---

## Token cPEN — Parámetros

| Propiedad        | Valor                          |
| ---------------- | ------------------------------ |
| Nombre           | Crypto PEN                     |
| Símbolo          | cPEN                           |
| Decimales        | 2                              |
| Peg              | 1 cPEN = 1 Sol Peruano (PEN)   |
| Colateral        | USDC (1 USDC = 3.80 cPEN)      |
| Estándar         | Token-2022                     |
| Transfer Fee     | 0.5% (50 basis points)         |
| Max Fee          | 10,000 cPEN por transacción    |
| Freeze Authority | Sí (compliance SBS/UIF)        |
| Metadata         | On-chain nativa (sin Metaplex) |

---

## Modelo de Recompensas

| Nivel contaminación | Descripción              | USDC      | cPEN equivalente |
| ------------------- | ------------------------ | --------- | ---------------- |
| `0`                 | Agua limpia              | 1.00 USDC | 3.80 S/          |
| `1`                 | Contaminación leve       | 1.00 USDC | 3.80 S/          |
| `2`                 | Contaminación moderada   | 2.00 USDC | 7.60 S/          |
| `3`                 | Contaminación crítica 🚨 | 5.00 USDC | 19.00 S/         |

Las alertas críticas (derrames, anomalías) reciben **5x más recompensa** para incentivar el reporte urgente.

---

## Datos Oceánicos Registrados On-Chain

| Parámetro     | Tipo Rust | Unidad on-chain | Ejemplo            |
| ------------- | --------- | --------------- | ------------------ |
| Temperatura   | `i32`     | centésimas °C   | `2250` = 22.50°C   |
| Salinidad     | `u32`     | centésimas PSU  | `3510` = 35.10 PSU |
| Altura de ola | `u32`     | centímetros     | `85` = 0.85 m      |
| Contaminación | `u8`      | nivel 0–3       | `3` = crítico      |
| Timestamp     | `i64`     | Unix timestamp  | sensor IoT         |

> Los enteros escalados evitan problemas de precisión con floats en programas on-chain — práctica estándar en Solana.

---

## Stack Técnico

| Capa            | Tecnología                                                     |
| --------------- | -------------------------------------------------------------- |
| Blockchain      | Solana Devnet                                                  |
| Smart contracts | Rust + Anchor 0.30.1                                           |
| Token estándar  | Token-2022 (SPL)                                               |
| Frontend        | Next.js 14 + TypeScript + Tailwind CSS                         |
| Wallet adapter  | @solana/wallet-adapter (Phantom, Solflare, Backpack, Coinbase) |
| Mapa            | Leaflet + CartoDB Dark Matter (sin API key)                    |
| Dev environment | GitHub Codespaces + devcontainer                               |

---

## Estructura del Repositorio

```
OceanSense/
│
├── programs/
│   └── ocean-sense-pay/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs              ← Programa principal (boyas, lecturas, vault)
│           └── cpen.rs             ← Token cPEN Token-2022
│
├── tests/
│   ├── anchor.test.ts              ← Tests vault + claim USDC
│   └── anchor.test.day2.ts         ← Tests mint/redeem/claim cPEN
│
├── app/                            ← Frontend Next.js
│   └── src/
│       ├── hooks/
│       │   └── useOceanSense.ts    ← Lógica Anchor completa
│       ├── components/
│       │   ├── Providers.tsx       ← Wallet adapter multi-wallet
│       │   ├── Navbar.tsx          ← Navegación + WalletMultiButton
│       │   └── BuoyMap.tsx         ← Mapa Leaflet + CartoDB Dark Matter
│       └── app/
│           ├── page.tsx            ← Dashboard + stats + mapa del litoral
│           ├── reading/page.tsx    ← Registrar boya + enviar lectura
│           ├── claim/page.tsx      ← Cobrar recompensas en cPEN
│           └── cpen/page.tsx       ← Mint / Redeem cPEN ↔ USDC
│
├── scripts/
│   ├── setup-cpen-mint.sh          ← Crear mint Token-2022 con extensiones
│   └── setup-frontend.sh           ← Instalar Next.js y dependencias
│
├── metadata/
│   └── cpen.json                   ← Metadata on-chain del token
│
├── .devcontainer/
│   ├── devcontainer.json           ← Codespace config
│   └── setup.sh                    ← Instala Solana + Anchor automáticamente
│
├── Anchor.toml
├── Cargo.toml
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

---

## Quickstart en GitHub Codespace

### Opción A — Abrir en Codespace (recomendado)

1. Clic en **Code → Codespaces → Create codespace on main**
2. Esperar ~3 min mientras `setup.sh` instala todo automáticamente
3. Verificar instalación:

```bash
solana --version
anchor --version
```

### Opción B — Local

```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Instalar Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Instalar Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.30.1 && avm use 0.30.1

# Clonar y setup
git clone https://github.com/TU-USUARIO/OceanSense.git
cd OceanSense
yarn install
```

---

## Deploy en Devnet

```bash
# 1. Configurar red
solana config set --url devnet

# 2. Generar wallet (si no tienes)
solana-keygen new --no-bip39-passphrase

# 3. Fondear con SOL de prueba
solana airdrop 5
# O usar: https://faucet.solana.com

# 4. Compilar y copiar IDL al frontend
yarn build

# 5. Deploy
anchor deploy

# 6. Actualizar .env con las addresses del deploy
cp .env.example .env
# Editar PROGRAM_ID, CPEN_MINT y sus variantes NEXT_PUBLIC_*

# 7. Correr tests
anchor test
```

---

## Levantar el Frontend

```bash
cd app
npm install
npm run dev
# → http://localhost:3000
```

### Páginas disponibles

| Ruta       | Descripción                                             |
| ---------- | ------------------------------------------------------- |
| `/`        | Dashboard con mapa del litoral + estadísticas de la red |
| `/reading` | Registrar nueva boya o enviar lectura oceánica          |
| `/claim`   | Ver y cobrar recompensas pendientes en cPEN             |
| `/cpen`    | Convertir USDC ↔ cPEN y ver balances                    |

---

## Tests

```bash
# Todos los tests
anchor test

# Solo vault + claim USDC
yarn run ts-mocha -p ./tsconfig.json tests/anchor.test.ts

# Solo cPEN mint/redeem
yarn run ts-mocha -p ./tsconfig.json tests/anchor.test.day2.ts
```

Resultado esperado:

```
🌊 Ocean-Sense
  ✔ Crea el USDC mock para Devnet
  ✔ Inicializa el vault global de USDC
  ✔ Fondea el vault con 100 USDC
  ✔ Registra la boya en el litoral peruano
  ✔ Envía lecturas oceánicas y acumula recompensas
  ✔ El operador cobra sus 6 USDC acumulados
  ✔ Rechaza claim cuando no hay USDC pendiente

💵 cPEN Token
  ✔ Prepara mints para Devnet
  ✔ Inicializa la configuración del cPEN
  ✔ Deposita 10 USDC y recibe 38 cPEN
  ✔ Quema 19 cPEN y recupera ~5 USDC
  ✔ Cobra recompensa de Ocean-Sense directamente en cPEN
  ✔ Verifica el estado final del protocolo cPEN

13 passing
```

---

## Errores Personalizados

| Código | Nombre                   | Descripción                           |
| ------ | ------------------------ | ------------------------------------- |
| `6000` | `StringTooLong`          | String supera tamaño máximo           |
| `6001` | `InvalidPollutionLevel`  | Nivel contaminación debe ser 0–3      |
| `6002` | `BuoyNotActive`          | Boya desactivada, no acepta lecturas  |
| `6003` | `Unauthorized`           | Solo el operador dueño puede ejecutar |
| `6004` | `Overflow`               | Overflow aritmético en contadores     |
| `6005` | `NothingToClaim`         | Sin recompensas pendientes            |
| `6006` | `InsufficientVaultFunds` | Vault sin fondos suficientes          |
| `6007` | `InvalidAmount`          | Monto inválido o cero                 |
| `6008` | `AmountTooSmall`         | Monto muy pequeño para convertir      |
| `6009` | `InsufficientBalance`    | Saldo insuficiente en cuenta          |

---

## Variables de Entorno

```bash
cp .env.example .env
```

| Variable                 | Descripción                                           |
| ------------------------ | ----------------------------------------------------- |
| `NEXT_PUBLIC_PROGRAM_ID` | Address del programa desplegado en Devnet             |
| `NEXT_PUBLIC_CPEN_MINT`  | Address del mint cPEN (creado con setup-cpen-mint.sh) |
| `NEXT_PUBLIC_USDC_MINT`  | Address del USDC en Devnet                            |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | RPC endpoint (por defecto: https://api.devnet.solana.com) |

---

## ¿Por qué Solana?

| Criterio      | Por qué importa para Ocean-Sense                                                |
| ------------- | ------------------------------------------------------------------------------- |
| Fees < $0.001 | Los pescadores envían lecturas cada hora — fees altos harían inviable el modelo |
| Sub-segundo   | Alertas de contaminación deben llegar en segundos, no minutos                   |
| Token-2022    | Transfer Fee nativo + Freeze Authority para compliance sin código extra         |
| DePIN líder   | Solana es el ecosistema líder en DePIN (Helium, Hivemapper, GEODNET)            |
| Composable    | Otros protocolos pueden leer datos Ocean-Sense sin permisos                     |

---

## Roadmap

### ✅ Hackathon

- [x] Registro de boyas on-chain con PDAs
- [x] Lecturas oceánicas inmutables con alertas de contaminación
- [x] Vault USDC + claim de recompensas via CPI
- [x] Token cPEN con Token-2022 (Transfer Fee + Metadata + Freeze)
- [x] Mint / Redeem cPEN ↔ USDC con vault de colateral
- [x] Frontend Next.js: dashboard, mapa CartoDB, claim, swap
- [x] Soporte multi-wallet (Phantom, Solflare, Backpack, Coinbase)
- [x] Tests completos en TypeScript

### 🔜 Post-hackathon

- [ ] Oracle de tipo de cambio PEN/USD on-chain
- [ ] Validación entre pares de lecturas anómalas
- [ ] Staking de operadores (skin in the game)
- [ ] SDK público para integrar datos Ocean-Sense
- [ ] Integración hardware IoT real (ESP32 + sensores CTD)

### 🔮 Visión

- [ ] Predicción de zonas de pesca con IA (datos on-chain → modelo off-chain)
- [ ] Dashboard para PRODUCE, SERNANP, DICAPI, Marina de Guerra
- [ ] Marketplace de datos oceánicos para investigadores y aseguradoras
- [ ] Expansión a otros litorales de LATAM

---

## Construido en el Solana LATAM Hackathon

> WayLearn × Solana Foundation · Categoría: BlueSky (DeSci + Fidelización)

Construido con ❤️ para el litoral peruano y los 40,000 pescadores artesanales que merecen datos oceánicos confiables.
