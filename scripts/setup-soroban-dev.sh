#!/usr/bin/env bash
# ApexRewards — Soroban development environment setup
set -euo pipefail

echo "==> Setting up Soroban dev environment for ApexRewards"

# Rust
if ! command -v rustup &>/dev/null; then
  echo "==> Installing Rust..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source "$HOME/.cargo/env"
fi

rustup update stable
rustup target add wasm32-unknown-unknown

# Stellar CLI
if ! command -v stellar &>/dev/null; then
  echo "==> Installing Stellar CLI..."
  cargo install --locked stellar-cli --features opt
fi

echo "Stellar CLI: $(stellar --version)"

# Local Stellar standalone (Docker)
if command -v docker &>/dev/null; then
  echo "==> Starting Stellar standalone node..."
  docker run -d \
    --name apex-stellar-standalone \
    -p 8000:8000 \
    --env NETWORK=standalone \
    --env ENABLE_SOROBAN_RPC=true \
    stellar/quickstart:latest || echo "Container already running"
fi

echo "==> Done. Run 'source ~/.cargo/env' if cargo is not in PATH."
