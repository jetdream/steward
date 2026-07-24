/**
 * Unit tests for the single-owner invariant (ACCS-3) — the r1-challenger HIGH:
 * the BetterAuth org plugin would let a role-change mint a SECOND owner; Steward
 * forbids it and moves ownership only via an atomic transfer. Pure policy, no DB,
 * no LLM (LRN-20).
 *
 * @verifies ACCS-3 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  guardMemberRemoval,
  guardRoleChange,
  OwnershipError,
  type OwnershipMember,
  planOwnershipTransfer,
} from "./ownership.js";

const OWNER: OwnershipMember = { id: "m-owner", userId: "u-owner", role: "owner" };
const ADMIN: OwnershipMember = { id: "m-admin", userId: "u-admin", role: "admin" };
const MEMBER: OwnershipMember = { id: "m-mem", userId: "u-mem", role: "member" };
const members = [OWNER, ADMIN, MEMBER];

const isForbidden = (e: unknown): e is OwnershipError =>
  e instanceof OwnershipError && e.code === "FORBIDDEN";
const isNotFound = (e: unknown): e is OwnershipError =>
  e instanceof OwnershipError && e.code === "NOT_FOUND";

test("a role change can never target the owner (no second owner via updateRole)", () => {
  assert.throws(() => guardRoleChange(OWNER), isForbidden);
  assert.doesNotThrow(() => guardRoleChange(ADMIN));
});

test("the owner cannot be removed directly (last-owner protection)", () => {
  assert.throws(() => guardMemberRemoval(OWNER), isForbidden);
  assert.doesNotThrow(() => guardMemberRemoval(MEMBER));
});

test("transfer demotes the sole owner and promotes exactly the target (atomic swap)", () => {
  assert.deepEqual(planOwnershipTransfer(members, "u-owner", "m-admin"), {
    demoteMemberId: "m-owner",
    promoteMemberId: "m-admin",
  });
});

test("only the current owner can transfer ownership", () => {
  assert.throws(() => planOwnershipTransfer(members, "u-admin", "m-mem"), isForbidden);
});

test("transferring to a non-member is refused", () => {
  assert.throws(() => planOwnershipTransfer(members, "u-owner", "m-ghost"), isNotFound);
});

test("transferring to the current owner is a no-op (org still has exactly one owner)", () => {
  assert.equal(planOwnershipTransfer(members, "u-owner", "m-owner"), null);
});
