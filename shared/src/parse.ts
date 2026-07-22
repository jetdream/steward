/**
 * The single boundary-validation helper. Untrusted data crossing an edge
 * (network, DB row, env, file, LLM output) is validated with its Zod schema and
 * returned typed — never cast (conventions: no unsafe parsing at any boundary).
 * Throws a labeled error naming the boundary so a failure is diagnosable.
 */
import type { ZodType } from "zod";

/**
 * Parse `value` against `schema`, returning the typed result or throwing.
 * @param boundary short label of where the data came from, for the error message
 */
export function parseAtBoundary<T>(schema: ZodType<T>, value: unknown, boundary: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`[${boundary}] validation failed: ${result.error.message}`);
  }
  return result.data;
}
