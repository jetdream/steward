/**
 * DM-1 Org — the customer organization and aggregate root; every other entity
 * is owned by an Org. This is the cross-boundary entity shape (the reference
 * pattern for entity schemas: a Zod object over branded IDs + shared enums,
 * with an inferred type). Capability-specific fields are added by the specs that
 * own them; this carries the core identity + news addressing.
 */
import { z } from "zod";
import { NewsDomainMode } from "../enums.js";
import { OrgId } from "../ids.js";

/** Org.newsConfig — the hosted-news addressing (NWS-1, DEC-10). */
export const NewsConfig = z.object({
  /** URL-safe org slug used in every addressing mode. */
  slug: z.string().min(1),
  /** app-path (dev default) | dedicated (prod default) | custom (org subdomain). */
  mode: NewsDomainMode,
  /** Present only when `mode` is `custom` (NWS-6). */
  customDomain: z.string().min(1).optional(),
});
export type NewsConfig = z.infer<typeof NewsConfig>;

/** The Org entity (core fields; owned-collection fields live on their entities). */
export const Org = z.object({
  id: OrgId,
  name: z.string().min(1),
  /** Optional donation link — a plain Memory-adjacent fact, not a module (scope.md). */
  donationUrl: z.url().optional(),
  newsConfig: NewsConfig,
});
export type Org = z.infer<typeof Org>;
