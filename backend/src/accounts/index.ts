/**
 * @module @backend/accounts (ARC-10 — Auth/Identity)
 *
 * The accounts/identity policy layer over BetterAuth (ADR-0006, SEC-7). Identity
 * itself (users, sessions, org-plugin memberships) is BetterAuth's; this module
 * owns the Steward-specific POLICY that the plugin does not enforce — today the
 * single-owner invariant (ACCS-3). Deterministic, transport-free, LLM-free
 * (LRN-20); the org router (routers/org.ts) is the thin caller.
 *
 * @implements ACCS-3 v1  (the single-owner invariant + member lifecycle policy)
 */
export type { OwnershipMember } from "./ownership.js";
export {
  guardMemberRemoval,
  guardRoleChange,
  OwnershipError,
  planOwnershipTransfer,
} from "./ownership.js";
