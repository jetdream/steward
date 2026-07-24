/**
 * @module @backend/accounts — the single-owner invariant (ACCS-3)
 *
 * Pure, deterministic policy over an org's memberships (LRN-20 — no LLM, no
 * content judgment). The BetterAuth organization plugin treats `owner` as an
 * ordinary role that `updateMemberRole` would freely duplicate; Steward enforces
 * EXACTLY ONE owner per org here. The org router (routers/org.ts) is the thin
 * caller that applies these decisions and maps {@link OwnershipError} onto tRPC
 * codes — this module stays transport-free.
 *
 * @implements ACCS-3 v1  (member lifecycle + the Steward-enforced single-owner invariant)
 */

/** A membership row narrowed to what the ownership policy reads (structural). */
export interface OwnershipMember {
  id: string;
  userId: string;
  role: string;
}

/** A policy violation; the router maps `.code` onto the matching TRPCError code. */
export class OwnershipError extends Error {
  constructor(
    readonly code: "FORBIDDEN" | "NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "OwnershipError";
  }
}

/**
 * Guard a role change (ACCS-3): the owner's role NEVER changes through the
 * role-change path — only via {@link planOwnershipTransfer}. Throws FORBIDDEN
 * when the target is the owner (so a role-change can never mint a second owner).
 */
export function guardRoleChange(target: OwnershipMember): void {
  if (target.role === "owner") {
    throw new OwnershipError("FORBIDDEN", "the owner's role changes only via ownership transfer");
  }
}

/**
 * Guard a member removal (ACCS-3): the owner is never removed directly (transfer
 * first — this is also the last-owner protection). Throws FORBIDDEN for the owner.
 */
export function guardMemberRemoval(target: OwnershipMember): void {
  if (target.role === "owner") {
    throw new OwnershipError("FORBIDDEN", "the owner cannot be removed; transfer ownership first");
  }
}

/**
 * Plan an atomic ownership transfer (ACCS-3): validate that `actorUserId` is the
 * current sole owner and `toMemberId` is a member of the same org set, then return
 * the two role writes to apply IN ONE TRANSACTION (demote the old owner → admin,
 * promote the target → owner) so the org always has exactly one owner. Returns
 * null when the target already IS the owner (a no-op). Throws {@link OwnershipError}
 * on any invalid transfer.
 */
export function planOwnershipTransfer(
  members: OwnershipMember[],
  actorUserId: string,
  toMemberId: string,
): { demoteMemberId: string; promoteMemberId: string } | null {
  const currentOwner = members.find((m) => m.role === "owner");
  if (!currentOwner || currentOwner.userId !== actorUserId) {
    throw new OwnershipError("FORBIDDEN", "only the current owner can transfer ownership");
  }
  const target = members.find((m) => m.id === toMemberId);
  if (!target) {
    throw new OwnershipError("NOT_FOUND", "target member not in this org");
  }
  if (target.id === currentOwner.id) return null;
  return { demoteMemberId: currentOwner.id, promoteMemberId: target.id };
}
