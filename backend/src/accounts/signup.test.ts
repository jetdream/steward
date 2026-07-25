/**
 * @verifies ONBS-1 v1  (the Org is created from name + email alone — never blocked)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { signupOrgName } from "./signup.js";

test("ONBS-1: the founder's typed org name is what the Org is called", () => {
  assert.equal(signupOrgName("dana@riverkeepers.org", "River Keepers"), "River Keepers");
  // Surrounding whitespace is not a different organization.
  assert.equal(signupOrgName("dana@riverkeepers.org", "  River Keepers  "), "River Keepers");
});

test("ONBS-1: email alone still yields a working org — signup never blocks", () => {
  assert.equal(signupOrgName("dana@riverkeepers.org"), "dana");
  assert.equal(signupOrgName("dana@riverkeepers.org", ""), "dana");
  assert.equal(signupOrgName("dana@riverkeepers.org", "   "), "dana");
});

test("ONBS-1: a degenerate address still names the org — never empty", () => {
  // BetterAuth rejects an empty org name, which would turn a nameless signup
  // into a hard block — exactly what "nothing blocks on completeness" forbids.
  assert.equal(signupOrgName("@riverkeepers.org"), "My organization");
  assert.equal(signupOrgName(""), "My organization");
});
