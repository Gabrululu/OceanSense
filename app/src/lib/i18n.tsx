export type Lang = "en" | "es";

const en = {
  nav: {
    dashboard: "Dashboard",
    submitReading: "Submit Reading",
    rewards: "Rewards",
    cpen: "cPEN",
    dataAccess: "Data Access",
    devnet: "Devnet",
  },
  hero: {
    eyebrow: "(01) — Peru · Pacific",
    frontier: "N°001 / Frontier '26",
    coords: "Lat —12.16 / Lng —77.03",
    title1: "An ocean",
    title2: "that pays back.",
    description: (
      <>
        A DePIN network where artisanal fishers operate IoT buoys and earn{" "}
        <strong style={{ fontWeight: 500 }}>cPEN</strong> — a Solana stablecoin pegged to the
        Peruvian Sol — for every verified ocean reading.
      </>
    ),
    descriptionMobile: (
      <>
        A DePIN network where artisanal fishers operate IoT buoys and earn{" "}
        <strong style={{ fontWeight: 500 }}>cPEN</strong> for every verified ocean reading.
      </>
    ),
    launchApp: "Launch App",
    exploreNetwork: "Explore Network",
    scroll: "Scroll · 01 / 06",
    live: "Devnet · live",
  },
  ticker: [
    "Ocean Sense",
    "Peru · Pacific Coast",
    "3,080 km Monitored",
    "Solana Devnet",
    "77,326 Artisanal Fishers",
    "< $0.001 / tx",
    "DePIN Network",
  ],
  network: {
    eyebrow: "(02) — Live Network",
    title: "Real-time data from Solana Devnet",
    refresh: "Refresh",
    activeBuoys: "Active Buoys",
    onDevnet: "on Devnet",
    totalReadings: "Total Readings",
    immutable: "immutable on-chain",
    cpenBalance: "cPEN Balance",
    inWallet: "in your wallet",
    coastline: "Coastline",
    peruMonitored: "Peru monitored",
  },
  problems: {
    eyebrow: "(03) — The Problem",
    title: "Peru's coast is flying blind",
    subtitle:
      "3,080 km of coastline with no real-time ocean data — and 77,326 fishers paying the price every season.",
    items: [
      {
        stat: "3,080 km",
        title: "No real-time monitoring",
        desc: "Peru's entire coastline has zero decentralized data infrastructure. IMARPE and SENAMHI are centralized, under-resourced, and slow to respond.",
      },
      {
        stat: "$3B lost",
        title: "El Niño 2023–2024",
        desc: "Catastrophic economic losses because no early-warning network existed. Fish populations collapsed overnight with no data to predict the event.",
      },
      {
        stat: "77,326",
        title: "Fishers without data",
        desc: "Artisanal fishers make life-and-death decisions based on experience alone. No temperature alerts, no pollution warnings, no community coordination.",
      },
    ],
  },
  howItWorks: {
    eyebrow: "(04) — How it Works",
    title: "Data to rewards in 3 steps",
    steps: [
      {
        title: "Deploy a Buoy",
        desc: "Fishers register their IoT buoy on-chain with GPS coordinates. Each buoy gets a Program Derived Address (PDA) on Solana.",
      },
      {
        title: "Submit Ocean Data",
        desc: "Buoys transmit temperature, salinity, wave height, and pollution level. Every reading is validated and stored immutably on Solana.",
      },
      {
        title: "Earn cPEN",
        desc: "Every valid reading pays the operator in cPEN — a Solana stablecoin pegged 1:1 to the Peruvian Sol. Critical pollution alerts pay 10× more.",
      },
    ],
  },
  fisher: {
    eyebrow: "(05) cPEN — Crypto Sol",
    title1: "A stablecoin",
    title2: "for the people",
    title3: "who feed Lima.",
    specLabels: {
      standard: "Standard",
      peg: "Peg",
      rate: "Tasa en vivo",
      loading: "Cargando…",
      collateral: "Collateral",
      collateralValue: "USDC colateralizado",
      transferFee: "Transfer fee",
      metadata: "Metadata",
    },
    standardValue: "Token-2022 (SPL)",
    pegValue: "1 cPEN = 1 Peruvian Sol",
    transferFeeValue: "0.5% · cap 10,000 cPEN",
    metadataValue: "Native on-chain · no Metaplex",
    location: "Paita · 05.06°S",
  },
  map: {
    eyebrow: "(05) — Live Map",
    title1: "Peru's monitoring",
    title2: "network.",
    totalBuoys: "Total buoys",
    active: "Active",
    inactive: "Inactive",
    coastlineLabel: "Peruvian Coastline",
    buoysCount: (n: number) => (n > 0 ? `${n} ${n !== 1 ? "buoys" : "buoy"} · click to inspect` : "Connect wallet"),
    solanaDevnet: "Solana Devnet",
    coordsFooter: "Lat —12.16 / Lng —77.03 · Peru",
    devnetLive: "◊ Devnet live",
  },
  buoysTable: {
    title: "Registered Buoys",
    total: (n: number) => `${n} total`,
    buoyId: "Buoy ID",
    location: "Location",
    status: "Status",
    readings: "Readings",
    usdc: "USDC",
    active: "Active",
    off: "Off",
  },
  whySolana: {
    eyebrow: "(06) — Why Solana",
    title: "Built for the real world",
    subtitle:
      "A network where fishers submit readings every hour demands near-zero fees and instant finality. Only one blockchain qualifies.",
    items: [
      {
        title: "< $0.001 per transaction",
        desc: "Fishers submit readings every hour. High fees would destroy the economic model. Solana makes it viable at scale.",
      },
      {
        title: "Sub-second finality",
        desc: "Pollution alerts must reach operators in seconds, not minutes. Solana's speed is non-negotiable for safety-critical data.",
      },
      {
        title: "Token-2022 native",
        desc: "Transfer Fee + Freeze Authority built in. SBS/UIF compliance and revenue sharing without extra smart contract code.",
      },
      {
        title: "DePIN ecosystem leader",
        desc: "Solana is home to Helium, Hivemapper, and GEODNET. Ocean-Sense follows a proven DePIN playbook on the best DePIN chain.",
      },
      {
        title: "Composable by design",
        desc: "Any Solana program can read Ocean-Sense PDAs permissionlessly — insurance, lending, weather apps, all without permission.",
      },
      {
        title: "Immutable audit trail",
        desc: "Every ocean reading lives in a PDA forever. Researchers, regulators, and insurers can verify data without trusting a middleman.",
      },
    ],
  },
  dataStrip: [
    { n: "3,080", l: "km de litoral" },
    { n: "77,326", l: "pescadores alcanzados" },
    { n: "$3B", l: "pérdida El Niño '23" },
    { n: "< $0.001", l: "fee por tx en Solana" },
  ],
  footer: {
    tagline1: "Built for the",
    tagline2: "Peruvian coast.",
    publicGood: "A public-good protocol for 77,326 artisanal fishers along 3,080 km of coastline.",
    protocol: "Protocol",
    links: [
      { label: "Buoy registry", desc: "register_buoy()" },
      { label: "Ocean readings", desc: "submit_reading()" },
      { label: "Claim rewards", desc: "claim_reward_as_cpen()" },
      { label: "cPEN mint", desc: "mint_cpen()" },
      { label: "Data access", desc: "fund_vault()" },
    ],
    stack: "Stack",
    stackItems: [
      { label: "Solana Devnet", tag: "chain" },
      { label: "Anchor 0.32.1", tag: "program" },
      { label: "Token-2022", tag: "standard" },
      { label: "Next.js 14", tag: "frontend" },
    ],
    copyright: "© 2026 OCEAN-SENSE LABS",
    privacy: "Privacy",
    terms: "Terms",
    coords: "—12.1648° S / —77.0283° W",
    license: "MIT License",
  },
  reading: {
    eyebrow: "/ iot buoy",
    title: "IoT Buoy",
    subtitle: "Register a buoy or submit ocean data.",
    tabReading: "Submit reading",
    tabRegister: "Register buoy",
    connectWallet: "Connect your wallet to submit readings.",
    buoyLabel: "Buoy",
    noOwnBuoys:
      'Your wallet has no registered buoys yet — only the wallet that registers a buoy can submit readings for it. Create one in the "Register buoy" tab.',
    temperature: "Temperature (°C)",
    salinity: "Salinity (PSU)",
    waveHeight: "Wave height (m)",
    pollutionLevel: "Pollution level",
    pollutionLabels: ["Clean", "Mild", "Moderate", "Critical 🚨"],
    estimatedReward: "Estimated reward",
    submitReading: "Submit reading",
    buoyIdLabel: "Buoy ID",
    buoyIdPlaceholder: "e.g. PAITA-001",
    zoneName: "Zone name",
    zoneNamePlaceholder: "e.g. North Paita Buoy",
    latitude: "Latitude (°)",
    longitude: "Longitude (°)",
    registerBuoy: "Register buoy",
    processing: "Processing…",
    viewExplorer: "View on Explorer",
  },
  claim: {
    eyebrow: "/rewards",
    title: "Rewards",
    connectWallet: "Connect your wallet to see your rewards.",
    subtitle: "Claim your ocean data in cPEN or raw USDC",
    vaultNoteBefore: "USDC comes from the institutional vault (see",
    vaultNoteAfter: ") — available now:",
    available: "available now",
    totalPending: "Total pending",
    usdcAccrued: "USDC accrued",
    youWillReceive: "You'll receive in cPEN",
    atRate: "at 1 USDC =",
    noRewards: "No pending rewards",
    noRewardsSub: "Submit readings to accrue USDC.",
    buoyId: "Buoy ID",
    location: "Location",
    readings: "Readings",
    pending: "Pending",
    action: "Action",
    activeStatus: "Active",
    inactiveStatus: "Inactive",
    claimUsdcTitle: "Claim in USDC from the institutional vault",
    claimAll: (amount: string) => `Claim all — S/ ${amount} cPEN`,
    processing: "Processing...",
    viewExplorer: "View on Explorer",
    whatIsCpen: "What is cPEN?",
    cpenFacts: [
      "Stablecoin pegged 1:1 to the Peruvian Sol (PEN)",
      "Issued on Solana with Token-2022 (0.5% Transfer Fee)",
      "Collateralized with USDC · Redeemable at any time",
    ],
    liveRate: (rate: string) => `1 USDC = ${rate} cPEN (live USD/PEN exchange rate)`,
  },
  cpenPage: {
    eyebrow: "/ cpen token",
    title: "cPEN Token",
    subtitle: "Convert between USDC and cPEN (digital Peruvian Sol)",
    connectWallet: "Connect your wallet to use cPEN.",
    devnet: "Devnet",
    pegLine: "1 cPEN = 1 S/",
    modeMint: "USDC → cPEN",
    modeRedeem: "cPEN → USDC",
    depositLabel: "You deposit (USDC)",
    burnLabel: "You burn (cPEN)",
    receiveCpen: "You receive (cPEN)",
    receiveUsdc: "You receive (USDC)",
    exchangeRate: "Exchange rate",
    live: "live",
    feeNotice:
      "cPEN transfers include a 0.5% fee (Token-2022 Transfer Fee) that goes to the Ocean-Sense protocol.",
    getButton: (amount: string) => `Get ${amount} cPEN`,
    recoverButton: (amount: string) => `Recover ${amount} USDC`,
    processing: "Processing...",
    viewExplorer: "View on Explorer",
    protocolStats: "Protocol stats",
    totalMinted: "Total minted",
    totalRedeemed: "Total redeemed",
    circulating: "In circulation",
  },
  data: {
    eyebrow: "/ data access",
    title: "Data Access & Institutional Subscriptions",
    subtitle:
      "Raw readings are public and free — the paid layer is aggregation, reliability, and real-time delivery.",
    publicFreeTitle: "Public & free",
    publicFreeDesc:
      "Every reading lives in a permissionless PDA on Solana Devnet. Anyone can read it directly — no API key, no gatekeeper.",
    viewExplorer: "View program on Explorer",
    paidTitle: "What's actually paid",
    paidDesc:
      "You can't paywall a public ledger. What institutions pay for is the layer on top: aggregation, historical export, real-time alert delivery, and an SLA.",
    tiers: [
      {
        name: "Free",
        audience: "Developers, community, transparency",
        features: [
          "Raw readings via program-derived accounts (Solana RPC)",
          "Full history, no rate limit",
          "No SLA — best effort",
        ],
      },
      {
        name: "Research",
        audience: "Universities, NGOs, independent researchers",
        features: ["Historical CSV export", "Aggregated stats API (/api/v1)", "Email support"],
      },
      {
        name: "Institutional",
        audience: "PRODUCE, SERNANP, DICAPI, Navy, insurers",
        features: [
          "Real-time pollution-alert webhooks",
          "SLA-backed uptime",
          "Priority integration support",
        ],
      },
    ],
    illustrativePricing: "Illustrative pricing for the demo — not a researched pricing model yet.",
    fundVaultTitle: "Fund the vault — how a subscription actually works",
    fundVaultDesc: (
      <>
        There&apos;s no separate billing system — an institutional subscription <em>is</em> a real
        on-chain <code>fund_vault()</code> call. The USDC lands in the same program-owned vault
        that operators withdraw from via <code>claim_reward</code> — subscription revenue and
        fisher payouts are the same pool, not two separate systems.
      </>
    ),
    connectToSubscribe: "Connect a wallet to subscribe.",
    subscribe: "Subscribe",
    processing: "Processing…",
    viewOnExplorer: "View on Explorer",
    totalFunded: "Total funded",
    paidToOperators: "Paid to operators",
    available: "Available",
    tryApiTitle: "Try the aggregation API",
    runIt: "Run it",
    running: "Running…",
    apiOpenNote: "Open for the demo — production would gate this behind an API key and meter it per tier.",
  },
  privacy: {
    eyebrow: "/privacy",
    title: "Privacy",
    lastUpdated:
      "Last updated August 2026 — Ocean-Sense is a hackathon prototype running on Solana Devnet.",
    sections: [
      {
        title: "What we collect",
        body: "Ocean-Sense does not run its own backend or database. Connecting a wallet (Phantom, Solflare, Backpack, or Coinbase) shares your public wallet address with the app so it can read your buoys, readings, and cPEN balance directly from Solana Devnet. We never see or store your private keys, seed phrase, email, or any off-chain personal information.",
      },
      {
        title: "On-chain data",
        body: "Buoy registrations and ocean readings (temperature, salinity, wave height, pollution level, coordinates) you submit are written to the Solana Devnet ledger. Like any blockchain transaction, this data is public and permanent by design — it is not covered by this policy because it isn't collected by us, it's published by you, directly to the chain.",
      },
      {
        title: "Analytics and cookies",
        body: "No analytics, tracking pixels, or advertising cookies. The app uses localStorage only to cache a USD/PEN exchange rate for up to one hour, and to remember your language preference.",
      },
      {
        title: "Third parties",
        body: "The app calls the Solana Devnet RPC, a public exchange-rate API for USD/PEN, and CARTO/OpenStreetMap for map tiles. Each of those requests happens directly from your browser and follows that provider's own policy.",
      },
    ],
    backHome: "Back to home",
  },
  terms: {
    eyebrow: "/terms",
    title: "Terms",
    lastUpdated: "Last updated August 2026 — read this before connecting a wallet.",
    sections: [
      {
        title: "Devnet only",
        body: "Ocean-Sense runs entirely on Solana Devnet. cPEN, USDC, and every reward shown in this app are test tokens with no real-world monetary value. Nothing here should be treated as a financial product, an investment, or a live payment rail for artisanal fishers — it's a working prototype built for a hackathon.",
      },
      {
        title: "No warranty",
        body: 'The protocol, this interface, and the Anchor program are provided "as is," without warranty of any kind. We don\'t guarantee uptime, the accuracy of submitted ocean readings, or that the Devnet program will keep running or keep its state. Data can be reset or the program redeployed at any time during development.',
      },
      {
        title: "Your wallet, your responsibility",
        body: "You are responsible for the security of your own wallet and seed phrase. Ocean-Sense never asks for your private key and will never initiate a transaction without your explicit signature in your wallet.",
      },
      {
        title: "License",
        body: "The source code is MIT-licensed and open for anyone to read, fork, or build on.",
      },
    ],
    backHome: "Back to home",
  },
  notFound: {
    eyebrow: "(404) — Off course",
    title: "This buoy isn't registered.",
    body: "The page you're looking for doesn't exist or moved. Head back to the main dashboard to keep monitoring the network.",
    backHome: "Back to home",
  },
  preloader: {
    tagline: "DePIN · Peruvian Coastline",
    subtitle: "DePIN Ocean Monitoring · Solana",
    stages: [
      "Connecting to Solana Devnet…",
      "Loading IoT buoy network…",
      "Initializing cPEN protocol…",
      "Syncing on-chain readings…",
      "Ready.",
    ],
    coords: "Lat —12.16 / Lng —77.03 · Peru · Pacific",
  },
  status: {
    registeringBuoy: "Registering buoy...",
    buoyRegistered: "Buoy registered",
    sendingReading: "Sending reading...",
    readingSent: "Reading sent",
    checkingCpenAccount: "Checking cPEN account…",
    creatingCpenAccount: "Creating cPEN account (first time)…",
    claimingCpen: "Claiming reward in cPEN…",
    cpenClaimed: "cPEN claimed",
    claimingUsdc: "Claiming reward in USDC…",
    usdcClaimed: "USDC claimed",
    convertingToCpen: "Converting USDC → cPEN…",
    cpenMinted: "cPEN minted",
    convertingToUsdc: "Converting cPEN → USDC...",
    usdcRecovered: "USDC recovered",
    processingSubscription: "Processing subscription…",
    subscriptionConfirmed: "Subscription confirmed",
    cpenMintNotConfigured: "NEXT_PUBLIC_CPEN_MINT not configured in .env.local",
  },
  errors: {
    userRejected: "You cancelled the transaction in your wallet.",
    insufficientFunds: "Insufficient balance to cover the network fee.",
    expired: "The transaction expired. Try again.",
    insufficientVaultFunds:
      "The USDC vault doesn't have enough funds yet — try again once there are more institutional subscriptions, or claim in cPEN instead.",
    networkError: "Network error. Check your connection and try again.",
    walletNotConnected: "Connect your wallet to continue.",
    accountNotFound:
      'That buoy isn\'t registered with this wallet — only the wallet that registered it can operate it. Make sure it\'s yours, or register it in the "Register buoy" tab.',
  },
} as const;

const es: typeof en = {
  nav: {
    dashboard: "Dashboard",
    submitReading: "Enviar lectura",
    rewards: "Recompensas",
    cpen: "cPEN",
    dataAccess: "Acceso a datos",
    devnet: "Devnet",
  },
  hero: {
    eyebrow: "(01) — Perú · Pacífico",
    frontier: "N°001 / Frontier '26",
    coords: "Lat —12.16 / Lng —77.03",
    title1: "Un océano",
    title2: "que retribuye.",
    description: (
      <>
        Una red DePIN donde pescadores artesanales operan boyas IoT y ganan{" "}
        <strong style={{ fontWeight: 500 }}>cPEN</strong> — un stablecoin de Solana anclado al Sol
        peruano — por cada lectura oceánica verificada.
      </>
    ),
    descriptionMobile: (
      <>
        Una red DePIN donde pescadores artesanales operan boyas IoT y ganan{" "}
        <strong style={{ fontWeight: 500 }}>cPEN</strong> por cada lectura oceánica verificada.
      </>
    ),
    launchApp: "Abrir app",
    exploreNetwork: "Explorar red",
    scroll: "Scroll · 01 / 06",
    live: "Devnet · en vivo",
  },
  ticker: [
    "Ocean Sense",
    "Perú · Costa Pacífica",
    "3,080 km monitoreados",
    "Solana Devnet",
    "77,326 pescadores artesanales",
    "< $0.001 / tx",
    "Red DePIN",
  ],
  network: {
    eyebrow: "(02) — Red en vivo",
    title: "Datos en tiempo real desde Solana Devnet",
    refresh: "Actualizar",
    activeBuoys: "Boyas activas",
    onDevnet: "en Devnet",
    totalReadings: "Lecturas totales",
    immutable: "inmutable on-chain",
    cpenBalance: "Balance cPEN",
    inWallet: "en tu wallet",
    coastline: "Litoral",
    peruMonitored: "monitoreado en Perú",
  },
  problems: {
    eyebrow: "(03) — El problema",
    title: "El litoral peruano está a ciegas",
    subtitle:
      "3,080 km de costa sin datos oceánicos en tiempo real — y 77,326 pescadores pagando el precio cada temporada.",
    items: [
      {
        stat: "3,080 km",
        title: "Sin monitoreo en tiempo real",
        desc: "Todo el litoral peruano no tiene ninguna infraestructura de datos descentralizada. IMARPE y SENAMHI son centralizados, con recursos insuficientes y lentos para responder.",
      },
      {
        stat: "$3,000M perdidos",
        title: "El Niño 2023–2024",
        desc: "Pérdidas económicas catastróficas porque no existía una red de alerta temprana. Las poblaciones de peces colapsaron de la noche a la mañana sin datos para predecir el evento.",
      },
      {
        stat: "77,326",
        title: "Pescadores sin datos",
        desc: "Los pescadores artesanales toman decisiones de vida o muerte basadas solo en la experiencia. Sin alertas de temperatura, sin avisos de contaminación, sin coordinación comunitaria.",
      },
    ],
  },
  howItWorks: {
    eyebrow: "(04) — Cómo funciona",
    title: "De los datos a las recompensas en 3 pasos",
    steps: [
      {
        title: "Despliega una boya",
        desc: "Los pescadores registran su boya IoT on-chain con coordenadas GPS. Cada boya recibe una Program Derived Address (PDA) en Solana.",
      },
      {
        title: "Envía datos oceánicos",
        desc: "Las boyas transmiten temperatura, salinidad, oleaje y nivel de contaminación. Cada lectura se valida y se guarda de forma inmutable en Solana.",
      },
      {
        title: "Gana cPEN",
        desc: "Cada lectura válida le paga al operador en cPEN — un stablecoin de Solana anclado 1:1 al Sol peruano. Las alertas críticas de contaminación pagan 10× más.",
      },
    ],
  },
  fisher: {
    eyebrow: "(05) cPEN — Crypto Sol",
    title1: "Un stablecoin",
    title2: "para la gente",
    title3: "que alimenta Lima.",
    specLabels: {
      standard: "Estándar",
      peg: "Peg",
      rate: "Tasa en vivo",
      loading: "Cargando…",
      collateral: "Colateral",
      collateralValue: "USDC colateralizado",
      transferFee: "Fee de transferencia",
      metadata: "Metadata",
    },
    standardValue: "Token-2022 (SPL)",
    pegValue: "1 cPEN = 1 Sol peruano",
    transferFeeValue: "0.5% · tope 10,000 cPEN",
    metadataValue: "Nativo on-chain · sin Metaplex",
    location: "Paita · 05.06°S",
  },
  map: {
    eyebrow: "(05) — Mapa en vivo",
    title1: "La red de monitoreo",
    title2: "del Perú.",
    totalBuoys: "Total de boyas",
    active: "Activas",
    inactive: "Inactivas",
    coastlineLabel: "Litoral peruano",
    buoysCount: (n: number) =>
      n > 0 ? `${n} boya${n !== 1 ? "s" : ""} · click para inspeccionar` : "Conecta tu wallet",
    solanaDevnet: "Solana Devnet",
    coordsFooter: "Lat —12.16 / Lng —77.03 · Perú",
    devnetLive: "◊ Devnet en vivo",
  },
  buoysTable: {
    title: "Boyas registradas",
    total: (n: number) => `${n} total`,
    buoyId: "ID de boya",
    location: "Ubicación",
    status: "Estado",
    readings: "Lecturas",
    usdc: "USDC",
    active: "Activa",
    off: "Off",
  },
  whySolana: {
    eyebrow: "(06) — Por qué Solana",
    title: "Hecho para el mundo real",
    subtitle:
      "Una red donde los pescadores envían lecturas cada hora exige fees casi nulos y finalidad instantánea. Solo una blockchain cumple.",
    items: [
      {
        title: "< $0.001 por transacción",
        desc: "Los pescadores envían lecturas cada hora. Fees altos destruirían el modelo económico. Solana lo hace viable a escala.",
      },
      {
        title: "Finalidad en menos de un segundo",
        desc: "Las alertas de contaminación deben llegar a los operadores en segundos, no minutos. La velocidad de Solana no es negociable para datos críticos.",
      },
      {
        title: "Token-2022 nativo",
        desc: "Transfer Fee y Freeze Authority incorporados. Compliance SBS/UIF y reparto de ingresos sin código extra en el contrato.",
      },
      {
        title: "Líder del ecosistema DePIN",
        desc: "Solana es el hogar de Helium, Hivemapper y GEODNET. Ocean-Sense sigue un manual DePIN ya probado en la mejor cadena para DePIN.",
      },
      {
        title: "Componible por diseño",
        desc: "Cualquier programa de Solana puede leer las PDAs de Ocean-Sense sin permiso — seguros, préstamos, apps del clima, todo sin pedir autorización.",
      },
      {
        title: "Registro de auditoría inmutable",
        desc: "Cada lectura oceánica vive para siempre en una PDA. Investigadores, reguladores y aseguradoras pueden verificar los datos sin confiar en un intermediario.",
      },
    ],
  },
  dataStrip: [
    { n: "3,080", l: "km de litoral" },
    { n: "77,326", l: "pescadores alcanzados" },
    { n: "$3,000M", l: "pérdida El Niño '23" },
    { n: "< $0.001", l: "fee por tx en Solana" },
  ],
  footer: {
    tagline1: "Hecho para el",
    tagline2: "litoral peruano.",
    publicGood: "Un protocolo de bien público para 77,326 pescadores artesanales a lo largo de 3,080 km de costa.",
    protocol: "Protocolo",
    links: [
      { label: "Registro de boyas", desc: "register_buoy()" },
      { label: "Lecturas oceánicas", desc: "submit_reading()" },
      { label: "Cobrar recompensas", desc: "claim_reward_as_cpen()" },
      { label: "Mint de cPEN", desc: "mint_cpen()" },
      { label: "Acceso a datos", desc: "fund_vault()" },
    ],
    stack: "Stack",
    stackItems: [
      { label: "Solana Devnet", tag: "chain" },
      { label: "Anchor 0.32.1", tag: "program" },
      { label: "Token-2022", tag: "standard" },
      { label: "Next.js 14", tag: "frontend" },
    ],
    copyright: "© 2026 OCEAN-SENSE LABS",
    privacy: "Privacidad",
    terms: "Términos",
    coords: "—12.1648° S / —77.0283° W",
    license: "Licencia MIT",
  },
  reading: {
    eyebrow: "/ boya iot",
    title: "Boya IoT",
    subtitle: "Registra una boya o envía datos oceánicos.",
    tabReading: "Enviar lectura",
    tabRegister: "Registrar boya",
    connectWallet: "Conecta tu wallet para enviar lecturas.",
    buoyLabel: "Boya",
    noOwnBuoys:
      'Tu wallet no tiene boyas registradas todavía — solo el wallet que registra una boya puede enviar lecturas para ella. Créala en la pestaña "Registrar boya".',
    temperature: "Temperatura (°C)",
    salinity: "Salinidad (PSU)",
    waveHeight: "Oleaje (m)",
    pollutionLevel: "Nivel de contaminación",
    pollutionLabels: ["Limpio", "Leve", "Moderado", "Crítico 🚨"],
    estimatedReward: "Recompensa estimada",
    submitReading: "Enviar lectura",
    buoyIdLabel: "ID de la boya",
    buoyIdPlaceholder: "ej: PAITA-001",
    zoneName: "Nombre de la zona",
    zoneNamePlaceholder: "ej: Boya Paita Norte",
    latitude: "Latitud (°)",
    longitude: "Longitud (°)",
    registerBuoy: "Registrar boya",
    processing: "Procesando...",
    viewExplorer: "Ver en Explorer",
  },
  claim: {
    eyebrow: "/recompensas",
    title: "Recompensas",
    connectWallet: "Conecta tu wallet para ver tus recompensas.",
    subtitle: "Cobra tus datos oceánicos en cPEN o en USDC crudo",
    vaultNoteBefore: "El USDC sale del vault institucional (ver",
    vaultNoteAfter: ") — disponible ahora:",
    available: "disponible ahora",
    totalPending: "Total pendiente",
    usdcAccrued: "USDC acumulado",
    youWillReceive: "Recibirás en cPEN",
    atRate: "al tipo 1 USDC =",
    noRewards: "Sin recompensas pendientes",
    noRewardsSub: "Envía lecturas para acumular USDC.",
    buoyId: "ID de boya",
    location: "Ubicación",
    readings: "Lecturas",
    pending: "Pendiente",
    action: "Acción",
    activeStatus: "Activa",
    inactiveStatus: "Inactiva",
    claimUsdcTitle: "Cobrar en USDC desde el vault institucional",
    claimAll: (amount: string) => `Cobrar todo — S/ ${amount} cPEN`,
    processing: "Procesando...",
    viewExplorer: "Ver en Explorer",
    whatIsCpen: "¿Qué es cPEN?",
    cpenFacts: [
      "Stablecoin pegged 1:1 al Sol Peruano (PEN)",
      "Emitida sobre Solana con Token-2022 (Transfer Fee 0.5%)",
      "Colateralizada con USDC · Redimible en todo momento",
    ],
    liveRate: (rate: string) => `1 USDC = ${rate} cPEN (tipo de cambio USD/PEN en vivo)`,
  },
  cpenPage: {
    eyebrow: "/ token cpen",
    title: "Token cPEN",
    subtitle: "Convierte entre USDC y cPEN (Sol Peruano digital)",
    connectWallet: "Conecta tu wallet para usar cPEN.",
    devnet: "Devnet",
    pegLine: "1 cPEN = 1 S/",
    modeMint: "USDC → cPEN",
    modeRedeem: "cPEN → USDC",
    depositLabel: "Depositas (USDC)",
    burnLabel: "Quemas (cPEN)",
    receiveCpen: "Recibes (cPEN)",
    receiveUsdc: "Recibes (USDC)",
    exchangeRate: "Tipo de cambio",
    live: "en vivo",
    feeNotice:
      "Las transferencias de cPEN incluyen un fee de 0.5% (Token-2022 Transfer Fee) que va al protocolo Ocean-Sense.",
    getButton: (amount: string) => `Obtener ${amount} cPEN`,
    recoverButton: (amount: string) => `Recuperar ${amount} USDC`,
    processing: "Procesando...",
    viewExplorer: "Ver en Explorer",
    protocolStats: "Stats del protocolo",
    totalMinted: "Total minted",
    totalRedeemed: "Total redeemed",
    circulating: "En circulación",
  },
  data: {
    eyebrow: "/ acceso a datos",
    title: "Acceso a Datos y Suscripciones Institucionales",
    subtitle:
      "Los datos crudos son públicos y gratis — la capa paga es agregación, confiabilidad y entrega en tiempo real.",
    publicFreeTitle: "Público y gratis",
    publicFreeDesc:
      "Cada lectura vive en una PDA permissionless en Solana Devnet. Cualquiera puede leerla directamente — sin API key, sin gatekeeper.",
    viewExplorer: "Ver programa en Explorer",
    paidTitle: "Qué es lo que realmente se paga",
    paidDesc:
      "No puedes poner un paywall a un ledger público. Lo que las instituciones pagan es la capa de encima: agregación, exportación histórica, entrega de alertas en tiempo real y un SLA.",
    tiers: [
      {
        name: "Free",
        audience: "Desarrolladores, comunidad, transparencia",
        features: [
          "Lecturas crudas vía program-derived accounts (Solana RPC)",
          "Historial completo, sin límite de rate",
          "Sin SLA — mejor esfuerzo",
        ],
      },
      {
        name: "Research",
        audience: "Universidades, ONGs, investigadores independientes",
        features: ["Exportación histórica en CSV", "API de stats agregadas (/api/v1)", "Soporte por email"],
      },
      {
        name: "Institutional",
        audience: "PRODUCE, SERNANP, DICAPI, Marina, aseguradoras",
        features: [
          "Webhooks de alertas de contaminación en tiempo real",
          "Uptime con SLA",
          "Soporte prioritario de integración",
        ],
      },
    ],
    illustrativePricing: "Precios ilustrativos para la demo — todavía no es un modelo de precios investigado.",
    fundVaultTitle: "Fondear el vault — cómo funciona realmente una suscripción",
    fundVaultDesc: (
      <>
        No hay un sistema de facturación separado — una suscripción institucional <em>es</em> una
        llamada real on-chain a <code>fund_vault()</code>. El USDC llega al mismo vault del
        programa del que los operadores retiran vía <code>claim_reward</code> — el ingreso por
        suscripciones y los pagos a los pescadores son el mismo pool, no dos sistemas separados.
      </>
    ),
    connectToSubscribe: "Conecta un wallet para suscribirte.",
    subscribe: "Suscribirse",
    processing: "Procesando…",
    viewOnExplorer: "Ver en Explorer",
    totalFunded: "Total fondeado",
    paidToOperators: "Pagado a operadores",
    available: "Disponible",
    tryApiTitle: "Prueba la API de agregación",
    runIt: "Ejecutar",
    running: "Ejecutando…",
    apiOpenNote: "Abierto para la demo — en producción esto se gatearía con una API key y se mediría por tier.",
  },
  privacy: {
    eyebrow: "/privacidad",
    title: "Privacidad",
    lastUpdated:
      "Última actualización agosto 2026 — Ocean-Sense es un prototipo de hackathon corriendo en Solana Devnet.",
    sections: [
      {
        title: "Qué recolectamos",
        body: "Ocean-Sense no corre su propio backend ni base de datos. Conectar un wallet (Phantom, Solflare, Backpack o Coinbase) comparte tu dirección pública con la app para que pueda leer tus boyas, lecturas y balance de cPEN directamente desde Solana Devnet. Nunca vemos ni guardamos tus llaves privadas, frase semilla, email, ni ninguna información personal fuera de la cadena.",
      },
      {
        title: "Datos on-chain",
        body: "Los registros de boyas y las lecturas oceánicas (temperatura, salinidad, oleaje, nivel de contaminación, coordenadas) que envías se escriben en el ledger de Solana Devnet. Como cualquier transacción blockchain, estos datos son públicos y permanentes por diseño — no están cubiertos por esta política porque no los recolectamos nosotros, los publicas tú directamente en la cadena.",
      },
      {
        title: "Analíticas y cookies",
        body: "Sin analíticas, píxeles de rastreo ni cookies de publicidad. La app usa localStorage solo para cachear el tipo de cambio USD/PEN hasta por una hora, y para recordar tu preferencia de idioma.",
      },
      {
        title: "Terceros",
        body: "La app llama al RPC de Solana Devnet, una API pública de tipo de cambio USD/PEN, y CARTO/OpenStreetMap para los tiles del mapa. Cada uno de esos requests sale directamente desde tu navegador y sigue la política propia de ese proveedor.",
      },
    ],
    backHome: "Volver al inicio",
  },
  terms: {
    eyebrow: "/términos",
    title: "Términos",
    lastUpdated: "Última actualización agosto 2026 — léelo antes de conectar un wallet.",
    sections: [
      {
        title: "Solo Devnet",
        body: "Ocean-Sense corre enteramente en Solana Devnet. cPEN, USDC y cada recompensa mostrada en esta app son tokens de prueba sin valor monetario real. Nada acá debe tratarse como un producto financiero, una inversión, o un riel de pago en vivo para pescadores artesanales — es un prototipo funcional construido para un hackathon.",
      },
      {
        title: "Sin garantía",
        body: 'El protocolo, esta interfaz y el programa de Anchor se entregan "tal cual", sin garantía de ningún tipo. No garantizamos uptime, la precisión de las lecturas oceánicas enviadas, ni que el programa en Devnet siga corriendo o mantenga su estado. Los datos pueden reiniciarse o el programa puede redesplegarse en cualquier momento durante el desarrollo.',
      },
      {
        title: "Tu wallet, tu responsabilidad",
        body: "Eres responsable de la seguridad de tu propio wallet y frase semilla. Ocean-Sense nunca pide tu llave privada y nunca va a iniciar una transacción sin tu firma explícita en tu wallet.",
      },
      {
        title: "Licencia",
        body: "El código fuente tiene licencia MIT y está abierto para que cualquiera lo lea, lo forkee o construya sobre él.",
      },
    ],
    backHome: "Volver al inicio",
  },
  notFound: {
    eyebrow: "(404) — Fuera de la ruta",
    title: "Esta boya no está registrada.",
    body: "La página que buscas no existe o cambió de lugar. Volvé al panel principal para seguir monitoreando la red.",
    backHome: "Volver al inicio",
  },
  preloader: {
    tagline: "DePIN · Litoral Peruano",
    subtitle: "DePIN Ocean Monitoring · Solana",
    stages: [
      "Conectando a Solana Devnet…",
      "Cargando red de boyas IoT…",
      "Inicializando protocolo cPEN…",
      "Sincronizando lecturas on-chain…",
      "Listo.",
    ],
    coords: "Lat —12.16 / Lng —77.03 · Perú · Pacífico",
  },
  status: {
    registeringBuoy: "Registrando boya...",
    buoyRegistered: "Boya registrada",
    sendingReading: "Enviando lectura...",
    readingSent: "Lectura enviada",
    checkingCpenAccount: "Verificando cuenta cPEN…",
    creatingCpenAccount: "Creando cuenta cPEN (primera vez)…",
    claimingCpen: "Cobrando recompensa en cPEN…",
    cpenClaimed: "cPEN cobrado",
    claimingUsdc: "Cobrando recompensa en USDC…",
    usdcClaimed: "USDC cobrado",
    convertingToCpen: "Convirtiendo USDC → cPEN…",
    cpenMinted: "cPEN minted",
    convertingToUsdc: "Convirtiendo cPEN → USDC...",
    usdcRecovered: "USDC recuperado",
    processingSubscription: "Procesando suscripción…",
    subscriptionConfirmed: "Suscripción confirmada",
    cpenMintNotConfigured: "NEXT_PUBLIC_CPEN_MINT no configurado en .env.local",
  },
  errors: {
    userRejected: "Cancelaste la transacción en tu wallet.",
    insufficientFunds: "Saldo insuficiente para cubrir la comisión de red.",
    expired: "La transacción expiró. Intenta de nuevo.",
    insufficientVaultFunds:
      "El vault de USDC no tiene fondos suficientes todavía — vuelve a intentar cuando haya más suscripciones institucionales, o cóbralo en cPEN.",
    networkError: "Error de red. Revisa tu conexión e intenta de nuevo.",
    walletNotConnected: "Conecta tu wallet para continuar.",
    accountNotFound:
      'Esa boya no está registrada con este wallet — solo el wallet que la registró puede operarla. Verifica que sea tuya o regístrala en la pestaña "Registrar boya".',
  },
};

export const i18n = { en, es };
