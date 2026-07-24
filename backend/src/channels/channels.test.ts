/**
 * Unit tests for the deterministic pieces of channel connect (ONBS-4 / SEC-10),
 * no DB: the pure `activates` gate and the AES-256-GCM secret-box round-trip
 * (seal → open, and tamper/format rejection).
 *
 * @verifies ONBS-4 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { open, seal } from "../crypto/secret-box.js";
import { activates } from "./index.js";

test("activates: only a `connected` channel publishes (ONBS-4)", () => {
  assert.equal(activates("connected"), true);
  assert.equal(activates("expired"), false);
  assert.equal(activates("revoked"), false);
  assert.equal(activates("error"), false);
});

test("secret-box seals credentials so plaintext never appears at rest (SEC-10)", () => {
  const secret = JSON.stringify({ accessToken: "tok-abc-123", refreshToken: "ref-xyz" });
  const sealed = seal(secret);
  assert.notEqual(sealed, secret);
  assert.ok(!sealed.includes("tok-abc-123"), "the raw token must not appear in the sealed blob");
  assert.equal(open(sealed), secret, "open reverses seal");
  assert.match(sealed, /^v1\./, "sealed form is versioned");
});

test("secret-box uses a fresh nonce — the same plaintext seals to different ciphertext", () => {
  const s = "same-secret";
  assert.notEqual(seal(s), seal(s));
});

test("secret-box rejects a tampered blob (GCM auth tag) and a bad format", () => {
  const sealed = seal("hello");
  const [v, iv, tag, data] = sealed.split(".");
  // Flip the ciphertext → auth-tag verification must fail.
  const tampered = [v, iv, tag, `${data}AA`].join(".");
  assert.throws(() => open(tampered));
  assert.throws(() => open("not-a-sealed-string"));
});
