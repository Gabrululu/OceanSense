#!/bin/bash
set -e

echo "🌊 Configurando Ocean-Sense Pay en Codespace (Ubuntu 24.04)..."

# ── 1. Rutas de persistencia ────────────────────────────
# Definimos la ruta segura donde guardaste la wallet
PERSISTENT_WALLET="/workspaces/OceanSense/wallets/dev-wallet.json"
DEFAULT_WALLET_DIR="$HOME/.config/solana"
DEFAULT_WALLET_PATH="$DEFAULT_WALLET_DIR/id.json"

# ── 2. Solana CLI ───────────────────────────────────────
if ! command -v solana &> /dev/null; then
    echo "📦 Instalando Solana CLI..."
    sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
fi

# Asegurar que los binarios estén en el PATH de la sesión actual
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# ── 3. Gestión de la Wallet (Lógica de Persistencia) ────
mkdir -p "$DEFAULT_WALLET_DIR"

if [ -f "$PERSISTENT_WALLET" ]; then
    echo "🔑 Recuperando wallet persistente desde /workspaces/..."
    cp "$PERSISTENT_WALLET" "$DEFAULT_WALLET_PATH"
elif [ ! -f "$DEFAULT_WALLET_PATH" ]; then
    echo "🆕 No se encontró wallet, generando una nueva..."
    solana-keygen new --no-bip39-passphrase --silent
    # Opcional: Respaldar la nueva wallet automáticamente en la zona persistente
    mkdir -p "/workspaces/OceanSense/wallets"
    cp "$DEFAULT_WALLET_PATH" "$PERSISTENT_WALLET"
fi

# Configurar Solana para usar la red y la wallet correctas
solana config set --url devnet --keypair "$DEFAULT_WALLET_PATH"

# ── 4. Anchor CLI (Versión 0.32.1 compatible con Ubuntu 24.04) ──
echo "⚓ Configurando Anchor..."
if ! command -v avm &> /dev/null; then
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
fi

export PATH="$HOME/.cargo/bin:$PATH"

# Instalamos la última versión (ya que ahora tenemos GLIBC 2.39)
avm install 0.32.1
avm use 0.32.1

# ── 5. Alias para corregir el error build-bpf (Truco final) ──
# Esto evita que Anchor falle si busca el comando antiguo
SOLANA_BIN_DIR="$HOME/.local/share/solana/install/active_release/bin"
if [ ! -L "$SOLANA_BIN_DIR/cargo-build-bpf" ]; then
    ln -s "$SOLANA_BIN_DIR/cargo-build-sbf" "$SOLANA_BIN_DIR/cargo-build-bpf" || true
fi

# ── 6. Dependencias y Entorno ────────────────────────────
echo "📦 Instalando dependencias de Node..."
npm install -g yarn
yarn install

if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 .env creado."
fi

echo "✅ ¡Setup completo y persistente!"
solana address && echo "🔑 Wallet activa: $(solana address)"