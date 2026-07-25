/**
 * The deterministic decisions behind the day-one home (XO-2 / ONBS-2, ONBS-6).
 *
 * Pure and unit-tested, because each one is a rule the surface would otherwise
 * express by accident: WHEN the home is in day-one shape, WHAT source to propose
 * reading, and HOW a Memory entry reads as a finding. No content judgment lives
 * here — this is structure and policy only (LRN-20).
 */

/**
 * Mail hosts that say nothing about an organization's website. Deriving
 * `gmail.com` as an org's public presence would send Steward off to read
 * Google's homepage and file it as the founder's mission — so a proposal is only
 * offered when the domain is plausibly the org's own.
 *
 * A deliberately short list: being wrong here costs one declined proposal (the
 * founder names the site instead), while being absent costs a nonsense read.
 */
const PUBLIC_MAIL_HOSTS: ReadonlySet<string> = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "fastmail.com",
]);

/**
 * The website to PROPOSE reading, derived from the founder's address — or null
 * when nothing plausible can be derived.
 *
 * A proposal, never a binding: ONBS-1's rule that a system-derived match is
 * confirmed by the founder before it is treated as the org's identity applies
 * just as much to "which website is yours". The caller must render this as a
 * question with a decline, never start reading on it silently.
 */
export function proposedSiteFromEmail(email: string | undefined): string | null {
  const at = email?.lastIndexOf("@") ?? -1;
  if (!email || at < 1) return null;
  const host = email
    .slice(at + 1)
    .trim()
    .toLowerCase();
  // A bare hostname needs at least one dot and no path/space to be a domain.
  if (!host.includes(".") || /[\s/]/.test(host)) return null;
  if (PUBLIC_MAIL_HOSTS.has(host)) return null;
  return `https://${host}`;
}

/**
 * Is the home in DAY-ONE shape (XO-2)?
 *
 * The switch is ONBS-6's deterministic minimum-viable-context predicate, not a
 * separate notion of "new": the home stops being day-one exactly when Steward
 * knows enough to write, which is the same moment first drafts become possible.
 * Treat an unanswered predicate as day-one — the alternative shows the weekly
 * visit's empty spine to an org with nothing in it.
 */
export function isDayOne(ready: { ready: boolean } | undefined): boolean {
  return ready?.ready !== true;
}

/** A Memory entry as the day-one stream shows it — one landed finding. */
export interface Finding {
  id: string;
  /** The entry type, as the founder-facing label ("program", "story"). */
  kind: string;
  /** The one line that says what was learned. */
  text: string;
  /** An inference awaiting the ONBS-5 review, so it carries an AssumedNote. */
  assumed: boolean;
}

/**
 * Render Memory entries as findings, newest first.
 *
 * The subject is prepended only when it adds something the content does not
 * already open with — a finding reading "Adoption days — Adoption days happen
 * every second Saturday" is the kind of duplication that makes a stream feel
 * machine-generated. The comparison is a prefix check on the entry's OWN two
 * fields, not a judgment about meaning (LRN-20).
 */
export function toFindings(
  entries: ReadonlyArray<{
    id: string;
    kind: string;
    subject: string | null;
    content: string;
    assumed: boolean;
  }>,
  limit: number,
): Finding[] {
  return entries
    .slice(-limit)
    .reverse()
    .map((e) => {
      const subject = e.subject?.trim();
      const content = e.content.trim();
      const redundant =
        subject !== undefined &&
        subject.length > 0 &&
        content.toLowerCase().startsWith(subject.toLowerCase());
      return {
        id: e.id,
        kind: e.kind,
        text: subject && !redundant ? `${subject} — ${content}` : content,
        assumed: e.assumed,
      };
    });
}
