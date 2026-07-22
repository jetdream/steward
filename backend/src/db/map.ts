/**
 * Row → entity mappers: the seam between the backend-internal persistence type
 * (Drizzle `OrgRow`) and the cross-boundary `@shared` entity. Mapping validates
 * through the entity schema, so what leaves the server is always a well-formed
 * entity (conventions: the schema is the contract). This demonstrates the
 * pattern every capability follows.
 */
import { Org } from "@shared";
import type { OrgRow } from "./schema.js";

/** Map a persisted Org row to the validated cross-boundary Org entity. */
export function toOrg(row: OrgRow): Org {
  return Org.parse({
    id: row.id,
    name: row.name,
    donationUrl: row.donationUrl ?? undefined,
    newsConfig: row.newsConfig,
  });
}
