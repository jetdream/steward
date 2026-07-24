/**
 * @module @backend/adapters/publishing — channel publishers (ADR-0003, PUBS-1)
 *
 * The dev/test publisher today: it returns a SYNTHETIC live URL so the delivery
 * pipeline (schedule → gate → publish → log) runs end-to-end without live Meta/X
 * app credentials (self-contained dev + CI, ADR-0003). The real adapters — Meta
 * (IG-1) and X (IG-2) — implement the same port through OFFICIAL platform APIs
 * ONLY (GR-6) and drop in when app creds + posting scopes land, without touching
 * callers. LIVE-publish smoke is therefore DEFERRED (no app creds in scope).
 * No vendor type leaks past `createChannelPublisher()`.
 */
import { randomUUID } from "node:crypto";
import type { ChannelPlatform } from "@shared";
import type { ChannelPublisher, PublishResult } from "../../ports/publishing.js";

/** Deterministic synthetic publisher — the dev/test adapter. Keyless, offline, never a real post. */
export function createDevChannelPublisher(): ChannelPublisher {
  return {
    name: "dev-publisher",
    async post(platform: ChannelPlatform): Promise<PublishResult> {
      const externalId = randomUUID();
      return { url: `https://dev-stub.local/${platform}/${externalId}`, externalId };
    },
  };
}

/**
 * Select the active channel publisher (ADR-0003). The dev publisher today; the
 * Meta (IG-1) + X (IG-2) official-API adapters are env-selected here once their
 * app credentials + posting scopes land (GR-6).
 */
export function createChannelPublisher(): ChannelPublisher {
  return createDevChannelPublisher();
}
