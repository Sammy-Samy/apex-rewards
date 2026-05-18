# ApexRewards

> **Trustless loyalty rewards on the Stellar blockchain.**  
> Earn, redeem, and trade APEX tokens — the on-chain rewards currency for the modern loyalty economy.

[![CI](https://github.com/Sammy-Samy/apex-rewards/actions/workflows/ci.yml/badge.svg)](https://github.com/Sammy-Samy/apex-rewards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-blue)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-blueviolet)](https://developers.stellar.org/docs/build/smart-contracts)
[![APEX Token](https://img.shields.io/badge/Token-APEX-orange)](docs/tokenomics.md)

---

## What is ApexRewards?

ApexRewards is an open-source loyalty rewards platform built on the Stellar blockchain. Businesses issue APEX tokens to customers for purchases, referrals, and engagement. Customers hold, trade, or redeem APEX across any participating merchant — all without a central intermediary.

**Who is it for?**
- Merchants who want a programmable, interoperable loyalty currency
- Customers who want rewards that actually hold value and never expire
- Developers building on Stellar / Soroban who need a reference loyalty implementation

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Next.js App                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Public Pages│  │  API Routes  │  │  Server Services │   │
│  │ /rewards    │  │ /api/rewards │  │  rewards.service │   │
│  │ /dashboard  │  │ /api/auth    │  │  token.service   │   │
│  │ /merchants  │  │ /api/cron    │  │  scheduler       │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   Payments (fiat)       PostgreSQL DB         Stellar Network
   (on-ramp)             (program records)     (APEX + Soroban)
                                                    │
                                          ┌─────────────────┐
                                          │  Apex Contract  │
                                          │ (Soroban/Rust)  │
                                          │  Issue / Redeem │
                                          │  Trustless swap │
                                          └─────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript |
| Backend | Next.js Route Handlers, service layer |
| Blockchain | Stellar, Soroban smart contracts (Rust) |
| Token | APEX on Stellar |
| Database | PostgreSQL |
| Cache | Redis |
| Infra | Docker, Kubernetes, Terraform (AWS) |
| Monitoring | Prometheus, Grafana, Alertmanager |

---

## Project Structure

```
apexRewards/
├── frontend/          # Next.js app
├── backend/           # API + services
├── nginx.conf         # Reverse proxy
└── .env.example       # Environment template
contracts/             # Soroban contracts (Rust)
k8s/                   # Kubernetes manifests + Helm chart
infra/terraform/       # AWS infrastructure
monitoring/            # Prometheus + Grafana
scripts/               # Dev + deploy scripts
docs/                  # Full documentation
```

---

## Smart Contract

| Function | Description |
|----------|-------------|
| `issue` | Mint APEX tokens to a customer wallet |
| `redeem` | Burn APEX tokens for a merchant reward |
| `transfer` | Peer-to-peer APEX transfer |
| `get_balance` | Query APEX balance for an address |
| `get_program` | Read reward program configuration |

Testnet contract: set `STELLAR_APEX_CONTRACT_ID` in your `.env`.

---

## Getting Started

```bash
git clone https://github.com/Sammy-Samy/apex-rewards.git
cd apex-rewards
cp apexRewards/.env.example apexRewards/.env.local
# Fill in environment variables
docker compose up -d
```

### Smart Contracts

```bash
bash scripts/setup-soroban-dev.sh
bash scripts/build-contracts.sh
bash scripts/test-contracts.sh
STELLAR_NETWORK=testnet bash scripts/deploy-contract.sh
```

---

## Documentation

- [Architecture](docs/architecture.md)
- [Smart Contracts](docs/contracts.md)
- [API Reference](docs/api/README.md)
- [Tokenomics](docs/tokenomics.md)
- [Stellar Integration](docs/stellar/integration.md)
- [Deployment Guide](docs/deployment/guides.md)
- [Operations Runbook](docs/ops/runbook.md)
- [Security](docs/security/README.md)

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.  
See [CHANGELOG.md](CHANGELOG.md) for history. See [ROADMAP.md](ROADMAP.md) for what's next.

Security issues → **security@apexrewards.app**

---

## License

[MIT](LICENSE) © 2024 ApexRewards
