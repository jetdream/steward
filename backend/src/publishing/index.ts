/**
 * @module @backend/publishing (ARC-18 — Publisher + Channel Adapters)
 *
 * The delivery layer. Today it owns the PUBS-2 per-channel technical profiles
 * (configuration consumed by the content engine's GENS-2 adaptation + GENS-5 fit
 * gate). Scheduling, the official-API publish adapters (GR-6), the publish log
 * (PUBS-3), and the kill switch land in a later increment.
 *
 * @implements PUBS-2 v1  (per-channel technical profiles)
 */
export type { ChannelProfile, LinkHandling } from "./channel-profiles.js";
export { allChannelProfiles, channelProfile } from "./channel-profiles.js";
