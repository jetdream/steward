/**
 * NewsConfig — the shape of the `orgs.newsConfig` JSON column (a value object,
 * not an entity/table). It is the single source for that column's `$type` and
 * for validating it at a boundary. (NWS-1, DEC-10.)
 */
import { z } from "zod";
import { NewsDomainMode } from "../enums.js";

/** Org.newsConfig — the hosted-news addressing. */
export const NewsConfig = z.object({
  /** URL-safe org slug used in every addressing mode. */
  slug: z.string().min(1),
  /** app-path (dev default) | dedicated (prod default) | custom (org subdomain, NWS-6). */
  mode: NewsDomainMode,
  /** Present only when `mode` is `custom`. */
  customDomain: z.string().min(1).optional(),
});
export type NewsConfig = z.infer<typeof NewsConfig>;
