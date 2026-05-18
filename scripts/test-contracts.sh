#!/usr/bin/env bash
# ApexRewards — Test Soroban contracts
set -euo pipefail

CONTRACTS_DIR="$(cd "$(dirname "$0")/../contracts" && pwd)"

echo "==> Running ApexRewards contract tests..."

for contract_dir in "$CONTRACTS_DIR"/*/; do
  contract=$(basename "$contract_dir")
  echo "  Testing: $contract"
  cargo test --manifest-path "$contract_dir/Cargo.toml" -- --nocapture
done

echo "==> All contract tests passed."
