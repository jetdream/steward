/**
 * @module @backend/ports/oauth — the channel OAuth-connect port (ADR-0003, ONBS-4)
 *
 * Abstracts the platform OAuth handshake behind a port so the connect flow stays
 * provider-agnostic. Official platform APIs only (GR-6): the prod adapters are
 * Meta (IG-1: FB Page / Instagram / Threads) and X (IG-2); the dev/test adapter
 * returns synthetic credentials so the connect flow runs without live app creds.
 * No vendor type leaks past this port. The returned credential is sealed at rest
 * by @backend/crypto (SEC-10) — this port never persists or logs it.
 */
import type { ChannelPlatform } from "@shared";

/** An OAuth credential as returned by the handshake — sealed before it is persisted (SEC-10). */
export interface OAuthCredential {
  accessToken: string;
  refreshToken?: string;
  /** Token expiry, when the platform issues one. */
  expiresAt?: Date;
}

/** The outcome of a successful connect: the account it publishes to + the credential to seal. */
export interface OAuthConnectResult {
  externalAccountRef: string;
  credential: OAuthCredential;
}

/** A channel OAuth connector, selected per environment (see `../adapters/oauth/`). */
export interface OAuthConnector {
  readonly name: string;
  /**
   * Complete the OAuth handshake for `platform` and return the account ref +
   * credential. `authCode` is the authorization code from the redirect (the dev
   * adapter ignores it). Throws on a handshake failure — the connect flow maps
   * that to a plain-language retry (ONBS-4), never a persisted broken row.
   */
  connect(platform: ChannelPlatform, authCode?: string): Promise<OAuthConnectResult>;
}
