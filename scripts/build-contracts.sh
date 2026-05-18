#!/usr/bin/env bash
# ApexRewards — Build Soroban contracts
set -euo pipefail

CONTRACTS_DIR="$(cd "$(dirname "$0")/../contracts" && pwd)"

echo "==> Building ApexRewards Soroban contracts..."

for contract_dir in "$CONTRACTS_DIR"/*/; do
  contract=$(basename "$contract_dir")
  echo "  Building: $contract"
  stellar contract build --manifest-path "$contract_dir/Cargo.toml"
done

echo "==> Build complete. WASM files in contracts/target/wasm32-unknown-unknown/release/"
