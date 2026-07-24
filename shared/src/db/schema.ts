/**
 * The Drizzle schema barrel — the SINGLE source of truth for entity shape
 * (DEC-39). Re-exports the BetterAuth-generated tables (auth-schema: user,
 * session, organization, member, invitation, account, verification); Steward's
 * own domain tables are added here as verticals land. @backend imports this for
 * the connection + queries; @client/@news get derived entity TYPES via @shared.
 *
 * Org (DM-1) IS the BetterAuth `organization`. Steward's Org-level domain fields
 * (e.g. donationUrl, news addressing) are added directly to `organization` via
 * the organization plugin's `additionalFields` by the vertical that owns them
 * (onboarding/news) — NOT a separate profile table.
 */
export * from "./auth-schema.js";
export * from "./content.js";
export * from "./memory.js";
export * from "./model-call.js";
