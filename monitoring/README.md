# ApexRewards Monitoring

Prometheus + Grafana + Alertmanager stack for ApexRewards.

## Stack

| Service | Port | Purpose |
|---------|------|---------|
| Prometheus | 9090 | Metrics collection |
| Alertmanager | 9093 | Alert routing |
| Grafana | 3002 | Dashboards |
| Node Exporter | 9100 | Host metrics |
| Postgres Exporter | 9187 | DB metrics |
| Redis Exporter | 9121 | Cache metrics |

## Quick Start

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Grafana: http://localhost:3002 (admin / see `GRAFANA_ADMIN_PASSWORD` in `.env`)

## Dashboards

- **ApexRewards Overview** — API rates, APEX token transfers, active programs, DB/Redis health, Stellar RPC latency

## Alerts

Edit `alertmanager.yml` to configure SMTP and PagerDuty credentials before deploying to production.

## Adding Custom Metrics

Instrument the backend with `prom-client` and expose `/metrics`. Prometheus scrapes it every 15 s.
