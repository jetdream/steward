/**
 * @module @backend/ports/blob — the blob-store port (ADR-0003)
 *
 * Stores media bytes for the DM-4 MediaAsset library. The prod adapter is
 * Cloudflare R2 / MinIO (S3-compatible, ADR-0003/ADR-0007); the dev/test adapter
 * is in-memory. No vendor type leaks past this port. AI-generated imagery is
 * disabled (GR-4) — every stored asset is a real upload / harvested file.
 */

/** The stored blob's key + a resolvable URL. */
export interface PutResult {
  key: string;
  url: string;
}

/** A blob store (media bytes), selected per environment (see `../adapters/blob/`). */
export interface BlobStore {
  readonly name: string;
  /** Store bytes under `key`; returns the key + a resolvable URL. */
  put(key: string, bytes: Uint8Array, contentType: string): Promise<PutResult>;
  /** A resolvable URL for a stored key (signed/public per adapter). */
  url(key: string): string;
}
