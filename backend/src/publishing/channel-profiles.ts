/**
 * PUBS-2 per-channel technical profiles — CONFIGURATION, not code. The SINGLE
 * source of each platform's technical constraints (character limits, media
 * requirements, link behavior, rate limits), consumed by GENS-2 (adaptation) and
 * GENS-5 (technical fit). Editing a limit here updates adaptation + fit with no
 * code change (R-6); profiles are per-channel and ISOLATED — changing one never
 * affects another (the isolated-adapter posture, ARC-18).
 *
 * @implements PUBS-2 v1  (per-channel technical profiles)
 */
import type { ChannelPlatform } from "@shared";

/** How a channel handles links in body text (drives GENS-2 adaptation). */
export type LinkHandling = "inline" | "appended" | "profile-only";

/** One channel's technical constraints (the GENS-5 technical-fit inputs). */
export interface ChannelProfile {
  platform: ChannelPlatform;
  /** Max characters in a post body. */
  maxChars: number;
  /** True when the platform REQUIRES media on every post (e.g. Instagram). */
  mediaRequired: boolean;
  /** Max images/attachments per post. */
  maxImages: number;
  /** How links behave: clickable inline, appended, or not clickable (profile-only). */
  linkHandling: LinkHandling;
  /** A conservative per-day publish rate ceiling (GR-6 official-API limits). */
  maxPostsPerDay: number;
}

/**
 * The four launch channels (PUB-4 LinkedIn is P2). Values reflect each platform's
 * documented limits; edit here — not in code — as platforms change (R-6).
 */
const PROFILES: Record<ChannelPlatform, ChannelProfile> = {
  facebook_page: {
    platform: "facebook_page",
    maxChars: 63206,
    mediaRequired: false,
    maxImages: 10,
    linkHandling: "inline",
    maxPostsPerDay: 10,
  },
  instagram: {
    platform: "instagram",
    maxChars: 2200,
    mediaRequired: true, // an Instagram post must carry an image/video
    maxImages: 10,
    linkHandling: "profile-only", // captions have no clickable links
    maxPostsPerDay: 10,
  },
  threads: {
    platform: "threads",
    maxChars: 500,
    mediaRequired: false,
    maxImages: 10,
    linkHandling: "inline",
    maxPostsPerDay: 20,
  },
  x: {
    platform: "x",
    maxChars: 280,
    mediaRequired: false,
    maxImages: 4,
    linkHandling: "inline", // links are auto-shortened + count as 23 chars
    maxPostsPerDay: 20,
  },
};

/** The technical profile for a channel (PUBS-2). */
export function channelProfile(platform: ChannelPlatform): ChannelProfile {
  return PROFILES[platform];
}

/** All channel profiles (for a full-fit sweep across connected channels). */
export function allChannelProfiles(): ChannelProfile[] {
  return Object.values(PROFILES);
}
