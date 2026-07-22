# Grafana LGTM — Local Observability Stack

All-in-one OpenTelemetry backend for local development: Loki (logs), Grafana, Tempo (traces), Mimir/Prometheus (metrics).

## Start / stop

```bash
docker compose -f .coder/grafana/docker-compose.yml up -d
docker compose -f .coder/grafana/docker-compose.yml down
```

The workspace `.coder/setup.sh` starts this automatically as Track D.

## Endpoints

| Service        | URL                      |
|----------------|--------------------------|
| Grafana UI     | http://localhost:3030    |
| OTLP HTTP      | http://localhost:4318    |
| OTLP gRPC      | http://localhost:4317    |

Grafana runs with anonymous admin access — no login in dev.

## Verification

1. Start the server (`npm run dev`) with `OTEL_ENABLED=true`.
2. Hit any `/api/*` endpoint.
3. Open Grafana at `http://localhost:3030` → Explore → Tempo, search by service.

## Production

Production uses direct OTLP → Google Cloud (Stackdriver). The LGTM container is dev-only.
