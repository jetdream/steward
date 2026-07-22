#!/bin/bash
# Steward dev-environment provisioner. Adapted from setup.sh.example for this
# project: npm workspaces (the four roots), the .coder docker stacks (Postgres +
# pgvector, MinIO, Grafana LGTM, Playwright), .env generation, and DB migration.
# Idempotent — safe to re-run. Realizes the DEC-36 / ADR-0007 self-contained dev
# environment. See README.md "Development infrastructure".

SETUP_LOG="/tmp/steward-setup.log"
SETUP_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SETUP_DIR/.." && pwd)"

# Tee all output to a log file for failure reporting.
exec > >(tee -a "$SETUP_LOG") 2>&1

on_failure() {
  local exit_code=$?
  [ $exit_code -ne 0 ] && echo "❌ Setup failed (exit $exit_code). See $SETUP_LOG."
}
trap on_failure EXIT
set -e
cd "$REPO_DIR"

# ─── Helpers ──────────────────────────────────────────────────────────────────

# Source NVM into the current shell. Safe to call before nvm is installed.
load_nvm() {
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] || return 0
  \. "$NVM_DIR/nvm.sh" || true
}

# upsert_env <file> <KEY> <VALUE> — set KEY=VALUE in file, replacing any existing line.
upsert_env() {
  local file="$1" key="$2" value="$3"
  mkdir -p "$(dirname "$file")"
  if [ -f "$file" ] && grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

# Workspace-aware URL for a port. In a Coder workspace, expand {{port}} in
# VSCODE_PROXY_URI; locally, fall back to localhost.
url_for_port() {
  local port="$1"
  if [ -n "$VSCODE_PROXY_URI" ]; then
    echo "$VSCODE_PROXY_URI" | sed "s/{{port}}/$port/" | sed 's|/$||'
  else
    echo "http://localhost:$port"
  fi
}

# Parallel-track bookkeeping.
TRACK_NAMES=(); TRACK_PIDS=(); TRACK_LOGS=(); TRACK_FATAL=()
run_track() {
  local name="$1" fn="$2" fatal="${3:-yes}"
  local log="/tmp/steward-setup-${name}.log"
  ( set -e; "$fn" ) > "$log" 2>&1 &
  TRACK_NAMES+=("$name"); TRACK_PIDS+=("$!"); TRACK_LOGS+=("$log"); TRACK_FATAL+=("$fatal")
}

# ─── Tracks ─────────────────────────────────────────────────────────────────

# Node 24 toolchain (from .nvmrc) + reproducible install + the LSP for Claude Code.
track_node() {
  echo "📥 [node] Installing Node.js toolchain..."
  if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  fi
  load_nvm
  if ! grep -q "NVM_DIR" ~/.bashrc 2>/dev/null; then
    cat >> ~/.bashrc <<'BASHRC'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
BASHRC
  fi

  local node_version="24"
  [ -f ".nvmrc" ] && node_version="$(cat .nvmrc)"
  echo "📦 [node] Installing Node $node_version..."
  nvm install "$node_version"
  nvm use "$node_version"
  nvm alias default "$node_version"

  # Expose node/npm/npx to already-open terminals via ~/.local/bin (on PATH).
  local node_bin cmd
  node_bin="$(dirname "$(nvm which "$node_version")")"
  mkdir -p "$HOME/.local/bin"
  for cmd in node npm npx; do ln -sf "$node_bin/$cmd" "$HOME/.local/bin/$cmd"; done

  echo "📦 [node] Installing dependencies (npm ci)..."
  npm ci

  echo "📦 [node] Installing the TypeScript language server (Claude Code LSP)..."
  npm install -g typescript-language-server typescript
  echo "✅ [node] Toolchain ready"
}

# Claude Code CLI + the local project-links status-bar extension. Optional bits
# are guarded so this track is safe outside a Coder / code-server workspace.
track_claude() {
  echo "📥 [claude] Installing Claude Code..."
  curl -fsSL https://claude.ai/install.sh | bash || echo "⚠️  [claude] CLI install skipped"

  if command -v code-server >/dev/null 2>&1; then
    if [ -f "$SETUP_DIR/install-vscode-extension.sh" ] && command -v jq >/dev/null 2>&1; then
      source "$SETUP_DIR/install-vscode-extension.sh"
      install_local_extension "$REPO_DIR/.vscode/project-links" "project-links" "0.1.0" || true
    fi
    code-server --install-extension anthropic.claude-code 2>/dev/null || true
    code-server --install-extension eamodio.gitlens 2>/dev/null || true
  else
    echo "ℹ️  [claude] code-server not found — skipping VS Code extensions"
  fi
  echo "✅ [claude] Ready"
}

# Backing services: Postgres + pgvector, and MinIO (the dev S3 blob adapter).
track_databases() {
  echo "🐳 [databases] Starting Postgres + pgvector and MinIO..."
  docker compose -f .coder/postgres/docker-compose.yml up -d
  docker compose -f .coder/minio/docker-compose.yml up -d
  echo "✅ [databases] Ready"
}

# Grafana LGTM — OpenTelemetry backend for dev (traces/logs/metrics).
track_grafana() {
  echo "📊 [grafana] Starting Grafana LGTM..."
  docker compose -f .coder/grafana/docker-compose.yml up -d
  echo "✅ [grafana] Ready (UI http://localhost:3030, OTLP http://localhost:4318)"
}

# Playwright browser (headed Chromium behind noVNC) for AI testing via the
# Playwright MCP in .mcp.json (CDP on :9222). Non-fatal: the image build is heavy,
# and a failure here must not block the rest of the environment.
track_playwright() {
  echo "🎭 [playwright] Building + starting the Playwright browser container..."
  docker compose -f .coder/playwright/docker-compose.yml up -d --build \
    && echo "✅ [playwright] Ready (noVNC http://localhost:6080/vnc_lite.html, CDP :9222)" \
    || echo "⚠️  [playwright] build/start failed — run 'npm run dev:playwright:build' later"
}

# ─── Initial (sequential) setup ─────────────────────────────────────────────

# Team default dotfiles (code-server settings, etc.).
[ -d "$SETUP_DIR/dotfiles" ] && cp -rT "$SETUP_DIR/dotfiles/" "$HOME/" || true

# Use gh as the git credential helper when available.
command -v gh >/dev/null 2>&1 && gh auth setup-git 2>/dev/null || true

export PATH="$HOME/.local/bin:$PATH"
grep -q 'HOME/.local/bin' ~/.bashrc 2>/dev/null || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# ─── .env ─────────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo "🔑 Generating .env from .env.example..."
  cp .env.example .env
  upsert_env ".env" BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
fi
# Workspace-aware app origin (Vite dev server on 3000).
upsert_env ".env" FRONTEND_URL "$(url_for_port 3000)"

# ─── VS Code status-bar project links ───────────────────────────────────────
export BASE_URL="$(url_for_port 3000)"
export DRIZZLE_URL="$(url_for_port 4983)"
export GRAFANA_URL="$(url_for_port 3030)"
export MINIO_URL="$(url_for_port 9001)"
export PLAYWRIGHT_URL="$(url_for_port 6080)"
export CODER_ISSUE_ID="${CODER_ISSUE_ID:-}"
export LINEAR_ISSUE_URL="${CODER_ISSUE_ID:+https://linear.app/diffco/issue/${CODER_ISSUE_ID}}"
if [ -f ".vscode/project-links.proto.json" ] && command -v envsubst >/dev/null 2>&1; then
  envsubst < ".vscode/project-links.proto.json" > ".vscode/project-links.json"
  echo "🔗 Project links configured"
fi

# ─── Parallel tracks ─────────────────────────────────────────────────────────
echo "🚀 Starting parallel setup..."
run_track node       track_node
run_track claude     track_claude   no
run_track databases  track_databases
run_track grafana    track_grafana  no
run_track playwright track_playwright no

echo "⏳ Waiting for parallel setup..."
TRACK_FAILED=()
for i in "${!TRACK_PIDS[@]}"; do
  if ! wait "${TRACK_PIDS[$i]}" && [ "${TRACK_FATAL[$i]}" = "yes" ]; then
    TRACK_FAILED+=("${TRACK_NAMES[$i]}")
  fi
done
for i in "${!TRACK_NAMES[@]}"; do
  echo ""; echo "=== Track: ${TRACK_NAMES[$i]} ==="; cat "${TRACK_LOGS[$i]}"
done
if [ ${#TRACK_FAILED[@]} -gt 0 ]; then
  echo "❌ Setup tracks failed: ${TRACK_FAILED[*]}"; exit 1
fi

load_nvm
export PATH="$HOME/.local/bin:$PATH"

# ─── Database migrate ─────────────────────────────────────────────────────────
# Needs both npm (track_node) and a healthy Postgres (track_databases). Loads
# .env so DATABASE_URL is set for drizzle-kit.
echo "🗄️  [db] Waiting for Postgres..."
PG_COMPOSE=".coder/postgres/docker-compose.yml"
for _ in $(seq 1 60); do
  docker compose -f "$PG_COMPOSE" exec -T postgres pg_isready -U user -d main >/dev/null 2>&1 && break
  sleep 1
done

set -a; . ./.env; set +a
echo "🗄️  [db] Generating + applying migrations..."
npm run db:generate
npm run db:migrate

echo "✅ Setup complete. Ready to code!"
echo "   App URL:  $BASE_URL   (start with 'npm run dev' once the app is built)"
echo "   Grafana:  $GRAFANA_URL   MinIO: $MINIO_URL   Drizzle Gateway: $DRIZZLE_URL"
