/**
 * @module @shared
 *
 * Cross-boundary types and pure helpers shared by @backend, @client, and @news
 * (constitution "Code Standards": cross-boundary types live once here; the other
 * roots import them, never redefine). The full type spine — Drizzle-inferred row
 * types (DM-*), Zod entity schemas, and the branded-ID registry — lands in the
 * next foundation increment (DEC-37 deliverable 3). This seed carries only the
 * nominal-typing primitive every entity ID builds on.
 *
 * Architecture: no runtime container of its own — a code package serving
 * ARC-2 (@client), ARC-3 (@backend), and ARC-23 (@news).
 */

/**
 * Nominal ("branded") type: a `Base` value tagged with a unique `Name` so that
 * IDs of different entities are not interchangeable (conventions: branded IDs,
 * never a bare `string`). Construct branded values behind a validated factory,
 * never with a bare cast in feature code.
 *
 * @example
 * type OrgId = Brand<string, "OrgId">;
 */
export type Brand<Base, Name extends string> = Base & {
  readonly __brand: Name;
};

/** Marks this package as loaded; replaced by real exports as the type spine grows. */
export const SHARED_PACKAGE = "@shared" as const;
