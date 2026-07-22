/**
 * The Drizzle database handle (ARC-4). A factory, not an import-time singleton,
 * so the connection string is injected at the composition root (no side effects
 * on import; testable). The Postgres provider is swappable behind this seam
 * (ADR-0003): dev/phase-1 docker-compose Postgres, phase-2 managed (Q-15).
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

/** Create the schema-aware Drizzle handle from a Postgres connection string. */
export function createDb(connectionString: string) {
  const sql = postgres(connectionString);
  return drizzle(sql, { schema });
}

/** The schema-aware Drizzle database handle type. */
export type Database = ReturnType<typeof createDb>;
