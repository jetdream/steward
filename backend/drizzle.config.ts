/**
 * drizzle-kit config — generates/applies SQL migrations from ./src/db/schema.ts.
 * Reads DATABASE_URL (see .env.example); the dev datastore is the docker-compose
 * Postgres + pgvector (DEC-36). Run via `npm run db:generate` / `npm run db:migrate`.
 */
import { defineConfig } from "drizzle-kit";

// The env file lives at the REPO ROOT, and both db scripts `cd backend` first —
// so drizzle-kit's own auto-load (which reads the cwd) finds nothing and the URL
// resolves to "". Load it explicitly from where it actually is. Optional on
// purpose: CI supplies DATABASE_URL in the environment with no .env file at all
// (LRN-34).
try {
  process.loadEnvFile?.(new URL("../.env", import.meta.url).pathname);
} catch {
  // No .env — the ambient environment is expected to carry DATABASE_URL.
}

export default defineConfig({
  schema: "../shared/src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
