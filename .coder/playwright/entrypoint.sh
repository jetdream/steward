#!/bin/bash
set -e

RESOLUTION="${SCREEN_RESOLUTION:-1280x720x24}"

APP_PORT="${APP_PORT:-3000}"

# --- Parse FQDN from VSCODE_PROXY_URI (Coder workspaces only) ---
# e.g. https://3000--main--1068631865-issue-234--jetdream.coder.example.com/
# When unset (local dev), we skip the HTTPS/FQDN setup and use plain HTTP to the host.
if [ -n "$VSCODE_PROXY_URI" ]; then
  FQDN=$(echo "$VSCODE_PROXY_URI" | sed "s|{{port}}|${APP_PORT}|" | sed -E 's|https?://([^/]+)/?|\1|')
  echo "Resolved FQDN: $FQDN"
  echo "127.0.0.1 $FQDN" >> /etc/hosts

  cat > /etc/caddy/Caddyfile <<CADDYEOF
{
  pki {
    ca local {
      intermediate_lifetime 720h
    }
  }
}

$FQDN {
  tls internal
  reverse_proxy host.docker.internal:$APP_PORT
}

:9223 {
  reverse_proxy 127.0.0.1:9222
}
CADDYEOF

  caddy start --config /etc/caddy/Caddyfile
  sleep 2

  CADDY_CA=$(find /root/.local/share/caddy /data/caddy 2>/dev/null -path "*/pki/authorities/local/root.crt" -print -quit)
  if [ -z "$CADDY_CA" ]; then
    echo "ERROR: Caddy root CA not found" >&2
    exit 1
  fi
  NSSDB="/home/pwuser/.pki/nssdb"
  mkdir -p "$NSSDB"
  certutil -d sql:"$NSSDB" -N --empty-password 2>/dev/null || true
  certutil -d sql:"$NSSDB" -A -t "C,," -n "Caddy Local CA" -i "$CADDY_CA"
  chown -R pwuser:pwuser /home/pwuser/.pki

  START_URL="https://$FQDN"
else
  echo "VSCODE_PROXY_URI not set — running in local mode (HTTP to host.docker.internal)"

  cat > /etc/caddy/Caddyfile <<CADDYEOF
:9223 {
  reverse_proxy 127.0.0.1:9222
}
CADDYEOF

  caddy start --config /etc/caddy/Caddyfile

  START_URL="http://host.docker.internal:$APP_PORT"
fi

# --- Start display stack ---
Xvfb :99 -screen 0 "$RESOLUTION" &
sleep 1

fluxbox &

x11vnc -display :99 -forever -nopw -shared -rfbport 5900 &

websockify --web /usr/share/novnc 6080 localhost:5900 &

# --- Launch Chrome as pwuser ---
runuser -u pwuser -- env \
  DISPLAY=:99 \
  GOOGLE_API_KEY=no \
  GOOGLE_DEFAULT_CLIENT_ID=no \
  GOOGLE_DEFAULT_CLIENT_SECRET=no \
  /ms-playwright/chromium-1169/chrome-linux/chrome \
    --disable-gpu \
    --no-first-run \
    --no-default-browser-check \
    --start-maximized \
    --remote-debugging-port=9222 \
    --remote-debugging-address=0.0.0.0 \
    "$START_URL" &

echo "Playwright debug environment ready"
echo "  App:      $START_URL"
echo "  noVNC:    http://localhost:6080/vnc_lite.html"
echo "  DevTools: http://localhost:9222"

exec "$@"
