#!/bin/bash
# .devcontainer/setup.sh
# Se ejecuta automáticamente al abrir el Codespace

set -e
echo "🌊 Configurando Ocean-Sense Pay en Codespace..."

# ── Solana CLI ───────────────────────────────────────────
echo "📦 Instalando Solana CLI..."
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc

# Configurar para Devnet
solana config set --url devnet

# Generar wallet de desarrollo si no existe
if [ ! -f ~/.config/solana/id.json ]; then
  solana-keygen new --no-bip39-passphrase --silent
  echo "🔑 Wallet generada: $(solana address)"
fi

# ── Anchor CLI ───────────────────────────────────────────
echo "⚓ Instalando Anchor..."
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force 2>/dev/null || true
export PATH="$HOME/.cargo/bin:$PATH"
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc

avm install 0.29.0
avm use 0.29.0

# ── Node dependencies ────────────────────────────────────
echo "📦 Instalando dependencias Node..."
npm install -g yarn
yarn install

# ── Copiar .env ──────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 .env creado desde .env.example — actualiza las addresses después del deploy"
fi

echo ""
echo "✅ Setup completo!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. anchor build          → compilar el programa"
echo "   2. solana airdrop 5      → obtener SOL de prueba"
echo "   3. anchor deploy         → desplegar en Devnet"
echo "   4. bash scripts/setup-cpen-mint.sh  → crear el mint cPEN"
echo "   5. anchor test           → correr los tests"
echo ""
solana address && echo "🔑 Tu wallet Devnet: $(solana address)"