/**
 * @module @backend/ports/publishing — the channel publish port (ADR-0003, PUBS-1)
 *
 * The outbound post to a social channel, behind a port so the Publisher stays
 * provider-agnostic. Official platform APIs ONLY (GR-6): the prod adapters are
 * Meta (IG-1: FB Page / Instagram / Threads) and X (IG-2); the dev/test adapter
 * returns a synthetic live URL so the delivery pipeline runs without live app
 * creds. No vendor type leaks past this port. The credential is opened server-side
 * by @backend/channels (SEC-10) and handed in here — this port never persists it.
 */
import type { ChannelPlatform } from "@shared";
import type { OAuthCredential } from "./oauth.js";

/** The result of a successful post: the live link (+ the platform's own id when returned). */
export interface PublishResult {
  url: string;
  externalId?: string;
}

/** A channel publisher, selected per environment (see `../adapters/publishing/`). */
export interface ChannelPublisher {
  readonly name: string;
  /**
   * Post `text` to `platform` with the channel credential; returns the live URL.
   * Official APIs only (GR-6). THROWS on a delivery failure — the Publisher maps
   * that to the retry/operator-alert path (PUBS-1, OPS-1), never a silent success.
   */
  post(
    platform: ChannelPlatform,
    credential: OAuthCredential,
    text: string,
  ): Promise<PublishResult>;
}
