/**
 * @module @backend/adapters/oauth — channel OAuth connectors (ADR-0003, ONBS-4)
 *
 * The dev/test connector today: it returns SYNTHETIC credentials so the connect
 * flow + health machine run end-to-end without live Meta/X app credentials
 * (self-contained dev + CI, ADR-0003). The real adapters — Meta (IG-1) and X
 * (IG-2) — implement the same port through OFFICIAL platform APIs only (GR-6) and
 * drop in when the app credentials + redirect wiring land, without touching
 * callers. LIVE-connect smoke is therefore DEFERRED (no app creds in scope).
 * No vendor type leaks past `createOAuthConnector()`.
 */
import type { ChannelPlatform } from "@shared";
import type { OAuthConnector, OAuthConnectResult } from "../../ports/oauth.js";

/**
 * Deterministic synthetic connector — the dev/test adapter. Produces a plausible
 * account ref + a fake, short-lived credential per platform. Keyless and offline.
 */
export function createDevOAuthConnector(): OAuthConnector {
  return {
    name: "dev-oauth",
    async connect(platform: ChannelPlatform): Promise<OAuthConnectResult> {
      return {
        externalAccountRef: `${platform}:dev-account`,
        credential: {
          accessToken: `dev-access-${platform}`,
          refreshToken: `dev-refresh-${platform}`,
          // 60 days out — a real Meta long-lived token horizon; the health machine reads it.
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      };
    },
  };
}

/**
 * Select the active OAuth connector (ADR-0003). The dev connector today; the
 * Meta (IG-1) + X (IG-2) official-API adapters are env-selected here once their
 * app credentials + redirect wiring land (GR-6).
 */
export function createOAuthConnector(): OAuthConnector {
  return createDevOAuthConnector();
}
