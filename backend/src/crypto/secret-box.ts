/**
 * @module @backend/crypto/secret-box — authenticated encryption at rest (SEC-10)
 *
 * Seals org secrets — today the DM-14 ChannelConnection OAuth credentials — with
 * AES-256-GCM before they touch the database, and opens them only server-side
 * when the Publisher (ARC-18) needs to post. The sealed form is an opaque,
 * self-describing string (`v1.<iv>.<tag>.<ciphertext>`, all base64url); it is
 * never logged and never sent to the client (SEC-10).
 *
 * The 32-byte key comes from `CHANNEL_SECRET_KEY` (base64/hex/utf-8, gitignored
 * env — never committed). In `development`/`test` without a key we derive a
 * FIXED dev key from a constant salt and warn ONCE — so the dev loop runs
 * keyless, while production REQUIRES a real key (throws if absent, NODE_ENV
 * !== development/test).
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_BYTES = 12; // GCM standard nonce length
const VERSION = "v1";

let cachedKey: Buffer | undefined;
let warnedDevKey = false;

/** Coerce an env value (base64 / hex / utf-8) to a 32-byte key; hash-normalize any other length. */
function coerceKey(raw: string): Buffer {
  for (const enc of ["base64", "hex"] as const) {
    try {
      const b = Buffer.from(raw, enc);
      if (b.length === 32) return b;
    } catch {
      // try the next encoding
    }
  }
  const utf8 = Buffer.from(raw, "utf-8");
  if (utf8.length === 32) return utf8;
  // Any other length → derive a stable 32 bytes so a passphrase still works.
  return createHash("sha256").update(utf8).digest();
}

/** Resolve (and cache) the 32-byte AES key (SEC-10). */
function key(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.CHANNEL_SECRET_KEY;
  if (raw && raw.length > 0) {
    cachedKey = coerceKey(raw);
    return cachedKey;
  }
  const env = process.env.NODE_ENV ?? "development";
  if (env !== "development" && env !== "test") {
    throw new Error(
      "SEC-10: CHANNEL_SECRET_KEY is required to seal channel credentials in production",
    );
  }
  if (!warnedDevKey) {
    console.warn(
      "[secret-box] CHANNEL_SECRET_KEY unset — using the FIXED dev key (dev/test only, SEC-10)",
    );
    warnedDevKey = true;
  }
  cachedKey = createHash("sha256").update("steward-dev-channel-secret-box").digest();
  return cachedKey;
}

/** Seal plaintext → the opaque `v1.<iv>.<tag>.<ciphertext>` string (SEC-10). */
export function seal(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    enc.toString("base64url"),
  ].join(".");
}

/** Open a sealed string → plaintext. Throws on a version mismatch or a failed auth tag (tamper). */
export function open(sealed: string): string {
  const [version, ivB64, tagB64, dataB64] = sealed.split(".");
  if (version !== VERSION || ivB64 === undefined || tagB64 === undefined || dataB64 === undefined) {
    throw new Error("secret-box: unrecognized sealed-credential format");
  }
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf-8");
}
