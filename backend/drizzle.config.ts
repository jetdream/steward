/**
 * drizzle-kit config — generates/applies SQL migrations from ./src/db/schema.ts.
 * Reads DATABASE_URL (see .env.example); the dev datastore is the docker-compose
 * Postgres + pgvector (DEC-36). Run via `npm run db:generate` / `npm run db:migrate`.
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../shared/src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
