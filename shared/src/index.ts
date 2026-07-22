/**
 * @module @shared
 *
 * Cross-boundary types and pure helpers shared by @backend, @client, and @news
 * (constitution "Code Standards"): the branded-ID registry, the fixed domain
 * enums, the Zod entity schemas + inferred types, and the boundary-parse helper.
 * The other roots IMPORT these; they never redefine them. Persistence row types
 * (Drizzle-inferred) stay in @backend and are mapped to these entities at the
 * server boundary (DEC-29).
 *
 * Architecture: no runtime container of its own — a code package serving
 * ARC-2 (@client), ARC-3 (@backend), and ARC-23 (@news).
 */

export * from "./entities/channel-connection.js";
export * from "./entities/org.js";
export * from "./enums.js";
export * from "./ids.js";
export * from "./parse.js";
