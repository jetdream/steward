/**
 * BetterAuth singleton + its Drizzle handle. Imported by the server (one shared
 * instance) and by the `better-auth` CLI for schema generation. Loads .env first
 * so DATABASE_URL is set at construction.
 */
import { createDb } from "../db/client.js";
import { createAuth } from "./auth.js";

try {
  process.loadEnvFile?.();
} catch {
  // .env optional — fall back to ambient env.
}

export const db = createDb(
  process.env.DATABASE_URL ?? "postgres://user:password@localhost:5432/main",
);
export const auth = createAuth(db);
