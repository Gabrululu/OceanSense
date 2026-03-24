#!/bin/bash
# setup-cpen-mint.sh
# Crea el mint de cPEN en Devnet con extensiones Token-2022
# Ejecutar ANTES de hacer deploy del programa
#
# Prerequisitos:
#   solana config set --url devnet
#   solana airdrop 5
#   spl-token --version  (debe ser >=3.4 para Token-2022)

set -e

echo "🌊 Ocean-Sense Pay — creando token cPEN en Devnet"
echo "=================================================="

# ── 1. Crear el mint con extensiones Token-2022 ──────────────────
echo ""
echo "📦 Paso 1: Crear mint cPEN con Token-2022..."

CPEN_MINT=$(spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  create-token \
  --decimals 2 \
  --enable-freeze \
  --transfer-fee 50 10000000 \
  2>/dev/null | grep "Creating token" | awk '{print $3}')

# Si el comando anterior falla en algunos entornos, intentar con output completo:
if [ -z "$CPEN_MINT" ]; then
  OUTPUT=$(spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
    create-token \
    --decimals 2 \
    --enable-freeze \
    --transfer-fee 50 10000000)
  echo "$OUTPUT"
  CPEN_MINT=$(echo "$OUTPUT" | grep -E "[A-Za-z0-9]{44}" | head -1 | awk '{print $NF}')
fi

echo "✅ cPEN Mint Address: $CPEN_MINT"

# ── 2. Transferir mint authority al PDA mint_config ──────────────
# El programa Anchor usa el PDA ["mint_config"] como mint authority.
# Sin este paso, mint_cpen y claim_reward_as_cpen fallarán en runtime.
echo ""
echo "🔑 Paso 2: Transfiriendo mint authority al PDA del programa..."

PROGRAM_ID="Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

# Calcular el PDA mint_config usando @solana/web3.js
MINT_CONFIG_PDA=$(node -e "
const { PublicKey } = require('@solana/web3.js');
const [pda] = PublicKey.findProgramAddressSync(
  [Buffer.from('mint_config')],
  new PublicKey('$PROGRAM_ID')
);
process.stdout.write(pda.toBase58());
" 2>/dev/null)

if [ -z "$MINT_CONFIG_PDA" ]; then
  echo "❌ No se pudo derivar el PDA. Verifica que node y @solana/web3.js estén instalados."
  echo "   Corre manualmente: spl-token authorize \$CPEN_MINT mint <MINT_CONFIG_PDA>"
  exit 1
fi

echo "   mint_config PDA: $MINT_CONFIG_PDA"

spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  authorize "$CPEN_MINT" mint "$MINT_CONFIG_PDA"

echo "✅ Mint authority transferida al PDA"

# ── 4. Agregar metadata al token ─────────────────────────────────
echo ""
echo "🏷️  Paso 3: Agregar metadata..."

spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  update-metadata "$CPEN_MINT" \
  name "Crypto PEN" \
  symbol "cPEN" \
  uri "https://raw.githubusercontent.com/tu-usuario/ocean-sense/main/metadata/cpen.json" \
  2>/dev/null || echo "⚠️  Metadata: usar initialize-metadata si update-metadata falla"

echo "✅ Metadata configurada"

# ── 5. Crear token account para el deployer ──────────────────────
echo ""
echo "💳 Paso 4: Crear token account..."

spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  create-account "$CPEN_MINT"

echo "✅ Token account creada"

# ── 6. Verificar configuración ───────────────────────────────────
echo ""
echo "🔍 Paso 5: Verificando configuración del mint..."
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  display "$CPEN_MINT"

# ── 5. Output para copiar en el programa ─────────────────────────
echo ""
echo "=================================================="
echo "✅ Setup completo. Copia estas addresses:"
echo ""
echo "  CPEN_MINT = \"$CPEN_MINT\""
echo ""
echo "  Pega CPEN_MINT en Anchor.toml y en tu frontend .env:"
echo "  NEXT_PUBLIC_CPEN_MINT=$CPEN_MINT"
echo "=================================================="