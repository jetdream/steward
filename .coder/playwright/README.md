# Playwright Browser Debug Environment

Containerized Chromium on a virtual display (Xvfb), accessible through noVNC in your browser. Caddy provides trusted HTTPS using the workspace's Coder FQDN.

## Quick Start

```bash
npm run dev                    # Start the app
npm run dev:playwright:build   # Build image (first time or after changes)
npm run dev:playwright         # Start container
npm run dev:playwright:stop    # Stop container
```

Open http://localhost:6080/vnc_lite.html or use the "Playwright (noVNC)" link in the Coder dashboard.

## How It Works

| Component | Role |
|-----------|------|
| **Xvfb** | Virtual X11 display (no GPU/monitor needed) |
| **Fluxbox** | Lightweight window manager |
| **x11vnc + noVNC** | VNC server + web-based VNC client |
| **Caddy** | HTTPS reverse proxy + CDP reverse proxy |
| **Chromium** | Playwright's bundled Chromium, running headed |

The container reads `VSCODE_PROXY_URI` (set by Coder) to derive the FQDN. Caddy generates a trusted internal certificate for this FQDN and proxies to the dev server on the host. The CA is imported into Chromium's NSS trust store so the browser shows a green padlock. Caddy also reverse-proxies CDP on port 9223 (Chrome binds its debug port to localhost only, so a proxy is needed for external access).

## Ports

| Port | Description |
|------|-------------|
| 6080 | noVNC web client |
| 5900 | Raw VNC (for native VNC clients) |
| 9222 | Chrome DevTools Protocol (via Caddy reverse proxy) |

## Configuration

Environment variables in `docker-compose.yml`:

| Variable | Default | Description |
|----------|---------|-------------|
| `SCREEN_RESOLUTION` | `1900x900x16` | Virtual display resolution |
| `VSCODE_PROXY_URI` | From host env | Coder workspace proxy URI template |
| `APP_PORT` | `3000` | Host port to reverse-proxy to |

## Playwright MCP Integration

The CDP port is exposed so that [Playwright MCP](https://github.com/microsoft/playwright-mcp) can connect to the container's browser from the host. Configuration lives in `.playwright/cli.config.json` at the project root and is picked up via the `PLAYWRIGHT_MCP_CONFIG` env var in `.mcp.json`.

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Image with Chromium, Xvfb, VNC, Caddy, Fluxbox |
| `entrypoint.sh` | Starts all services and launches Chromium |
| `docker-compose.yml` | Container configuration (separate from DB compose) |
