#!/usr/bin/env bash
# ApexRewards — Deploy Soroban contracts
set -euo pipefail

NETWORK="${STELLAR_NETWORK:-testnet}"
ADMIN_SECRET="${STELLAR_ADMIN_SECRET_KEY:?STELLAR_ADMIN_SECRET_KEY is required}"
CONTRACTS_DIR="$(cd "$(dirname "$0")/../contracts" && pwd)"

case "$NETWORK" in
  standalone)
    RPC_URL="http://localhost:8000/soroban/rpc"
    PASSPHRASE="Standalone Network ; February 2017"
    ;;
  testnet)
    RPC_URL="https://soroban-testnet.stellar.org"
    PASSPHRASE="Test SDF Network ; September 2015"
    ;;
  mainnet)
    RPC_URL="https://soroban-rpc.stellar.org"
    PASSPHRASE="Public Global Stellar Network ; September 2015"
    ;;
  *) echo "Unknown network: $NETWORK"; exit 1 ;;
esac

echo "==> Deploying ApexRewards contracts to $NETWORK"

# Build first
bash "$(dirname "$0")/build-contracts.sh"

for wasm in "$CONTRACTS_DIR"/target/wasm32-unknown-unknown/release/*.wasm; do
  name=$(basename "$wasm" .wasm)
  echo "  Deploying: $name"
  CONTRACT_ID=$(stellar contract deploy \
    --wasm "$wasm" \
    --source "$ADMIN_SECRET" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$PASSPHRASE")
  echo "  $name deployed: $CONTRACT_ID"
  echo "APEX_${name^^}_CONTRACT_ID=$CONTRACT_ID" >> .env.deployed
done

echo "==> Deployment complete. Contract IDs saved to .env.deployed"
