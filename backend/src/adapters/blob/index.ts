/**
 * @module @backend/adapters/blob — blob-store adapters (ADR-0003)
 *
 * The in-memory dev/test store today (self-contained dev + CI, ADR-0003). The
 * S3-compatible adapter (MinIO dev / Cloudflare R2 prod, ADR-0007) needs the AWS
 * SDK client and lands with the deployment wiring — the port is stable, so it
 * drops in without touching callers. No vendor type leaks past `createBlobStore()`.
 */
import type { BlobStore } from "../../ports/blob.js";

/** In-memory blob store — deterministic, keyless; the dev/test adapter. */
export function createMemoryBlobStore(): BlobStore {
  const store = new Map<string, { bytes: Uint8Array; contentType: string }>();
  return {
    name: "memory",
    async put(key, bytes, contentType) {
      store.set(key, { bytes, contentType });
      return { key, url: `memory://blob/${key}` };
    },
    url: (key) => `memory://blob/${key}`,
  };
}

/** Process-shared in-memory store, so bytes uploaded in one request are retrievable in the next. */
let sharedMemoryStore: BlobStore | undefined;

/**
 * Select the active blob store (ADR-0003). A process-singleton in-memory store
 * today; the S3/MinIO/R2 adapter (ADR-0007) is env-selected here once the AWS SDK
 * dependency + deploy wiring land.
 */
export function createBlobStore(): BlobStore {
  sharedMemoryStore ??= createMemoryBlobStore();
  return sharedMemoryStore;
}
