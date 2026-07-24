/**
 * @module @backend/publishing (ARC-18 — Publisher + Channel Adapters)
 *
 * The delivery layer. Owns the PUBS-2 per-channel technical profiles
 * (configuration consumed by the content engine's GENS-2 adaptation + GENS-5 fit
 * gate) AND the Publisher: scheduled, gated, official-API delivery of approved
 * ChannelVariants (PUBS-1) plus the append-only publish log (PUBS-3). The publish
 * gate is deterministic and composes the AUT-3 pause (@backend/autonomy) + the
 * ONBS-4 connection health (@backend/channels) + the BILS-2 subscription check.
 *
 * @implements PUBS-1 v3  (channels at launch — official APIs, scheduled, gated delivery)
 * @implements PUBS-2 v1  (per-channel technical profiles)
 * @implements PUBS-3 v1  (append-only publish log)
 */
export type { ChannelProfile, LinkHandling } from "./channel-profiles.js";
export { allChannelProfiles, channelProfile } from "./channel-profiles.js";
export {
  createPublisher,
  type PublishBlock,
  type Publisher,
  type PublisherDeps,
  type PublishLogEntry,
  type PublishOutcome,
  publishability,
} from "./publish.js";
