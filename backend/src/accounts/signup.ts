/**
 * The signup-time naming rule (ONBS-1 / ACCS-1).
 *
 * ONB-1 promises "org name + email is enough". The org's name is therefore a
 * FOUNDER-PROVIDED fact — the doorstep (XO-6) asks for it — and this module is
 * the one place that decides what the Org is called when the signup triple is
 * created.
 *
 * The fallback matters: dev sign-in has always been email-only, and a returning
 * founder who types nothing but an address must still land in a working org
 * (nothing blocks on completeness — ONBS-1). Deriving from the address is a
 * placeholder the founder can rename, never a claim about the organization.
 *
 * @implements ONBS-1 v1  (the Org is created from name + email alone)
 */

/** What the derived fallback is called when an address yields nothing usable. */
const UNNAMED_ORG = "My organization";

/**
 * The name for the Org created at signup.
 *
 * Precedence: what the founder typed on the doorstep, then the email's local
 * part as a renameable placeholder, then a neutral constant. Never empty —
 * an unnamed org would fail BetterAuth's org creation and block a signup that
 * ONBS-1 says must not block.
 */
export function signupOrgName(email: string, orgName?: string | undefined): string {
  const provided = orgName?.trim();
  if (provided) return provided;
  const local = email.split("@")[0]?.trim();
  return local || UNNAMED_ORG;
}
