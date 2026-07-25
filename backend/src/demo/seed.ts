/**
 * @module @backend/demo — the deterministic demo seed
 *
 * A synthetic organization with every Ready-spine state visible at once, so the
 * approval surface can be evaluated by a human and asserted by the story tier
 * without waiting on a model to happen to produce the right mix.
 *
 * **Synthetic only (SEC-4).** Every fact here is invented for a fictional
 * shelter. No real org's content is ever seeded, quoted, or copied — not into
 * this file, not into a fixture, not into an eval set.
 *
 * **Deterministic (LRN-20).** Rows are written straight through Drizzle, not
 * generated: the point is to PIN the states — a clean approvable card, a GR-3
 * held card, an awaiting-picture card, and a variant skipped with its reason —
 * which a model run cannot be relied on to reproduce. It is also why the seed is
 * usable in CI: no key, no network, no flake.
 *
 * Idempotent: re-seeding wipes the demo org's content and rewrites it, so a
 * walkthrough always starts from the same screen.
 *
 * E9 seeds the spine. E14 extends the same function with the rest of the
 * walkthrough's states (publish log, channel health, discoveries, rhythm).
 */
import { randomUUID } from "node:crypto";
import type { OrgId } from "@shared";
import { channelVariant, contentItem, mediaAsset, memoryEntry } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client.js";

/** The address the demo founder signs in with — dev email-only login (SEC-7). */
export const DEMO_EMAIL = "demo@steward.test";

/**
 * A separate demo org per e2e project.
 *
 * The Ready stories DISPOSE of cards, and Playwright runs the desktop and phone
 * projects concurrently — sharing one org would have each project clearing the
 * other's stack, so neither would be asserting the thing it claims. One org per
 * project keeps them independent without serialising the run. `DEMO_EMAIL`
 * itself stays untouched for the human walkthrough.
 */
export const demoEmailFor = (project: string): string => `demo+${project}@steward.test`;

/** The demo organization's name, as it appears in the home's greeting. */
export const DEMO_ORG_NAME = "Riverside Animal Shelter";

/** What the seed wrote, for the script's report. */
export interface SeedReport {
  orgId: string;
  memoryEntries: number;
  cards: number;
  variants: number;
}

/**
 * A tiny inline SVG standing in for an org photo.
 *
 * A data URI rather than a file or a blob key on purpose: the seed has to work
 * in CI and in a fresh checkout with no MinIO running, and a broken image in the
 * one card that demonstrates the picture invariant would read as a bug in the
 * invariant itself.
 */
const PLACEHOLDER_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3">
     <rect width="4" height="3" fill="#d8cfc2"/>
     <circle cx="2" cy="1.4" r="0.6" fill="#b5502e"/>
   </svg>`,
)}`;

/**
 * Wipe and rewrite the demo org's content.
 *
 * Deleting first is what makes the walkthrough repeatable — a seed that appended
 * would show a founder eleven near-identical drafts on the third run and hide
 * the state coverage it exists to demonstrate.
 */
export async function seedDemoOrg(db: Database, orgId: OrgId): Promise<SeedReport> {
  await db.delete(channelVariant).where(eq(channelVariant.orgId, orgId));
  await db.delete(contentItem).where(eq(contentItem.orgId, orgId));
  await db.delete(mediaAsset).where(eq(mediaAsset.orgId, orgId));
  await db.delete(memoryEntry).where(eq(memoryEntry.orgId, orgId));

  // ── Memory: enough grounded context that the home leaves day-one shape
  //    (ONBS-6 wants identity + one program/story fact).
  const memory = [
    {
      kind: "fact" as const,
      subject: "Riverside Animal Shelter",
      content:
        "Riverside Animal Shelter is a no-kill shelter in Cedar Hollow, founded in 2016, serving the river valley.",
      assumed: false,
    },
    {
      kind: "program" as const,
      subject: "Second Saturday adoptions",
      content: "Adoption days run the second Saturday of every month at Bell Meadow Park.",
      assumed: false,
    },
    {
      kind: "story" as const,
      subject: "Marbles",
      content: "Marbles, a senior beagle, waited 214 days before a family adopted her this spring.",
      assumed: false,
    },
    {
      kind: "person" as const,
      subject: "Dana Okafor",
      content: "Dana Okafor founded the shelter and still runs the Saturday intake shift.",
      // Left ASSUMED on purpose: the walkthrough needs an AssumedNote to correct.
      assumed: true,
    },
    {
      kind: "taboo" as const,
      subject: "donor names",
      content: "Never name individual donors in a post.",
      assumed: false,
    },
  ];
  await db.insert(memoryEntry).values(
    memory.map((m) => ({
      id: randomUUID(),
      orgId,
      kind: m.kind,
      subject: m.subject,
      content: m.content,
      subjectKey: m.subject.toLowerCase(),
      source: { trigger: "dev-seed" as const, detail: "synthetic demo data (SEC-4)" },
      assumed: m.assumed,
    })),
  );

  // ── One picture, so exactly one card can legitimately be approved (GENS-3).
  const photoId = randomUUID();
  await db.insert(mediaAsset).values({
    id: photoId,
    orgId,
    blobKey: `demo/${orgId}/marbles.svg`,
    url: PLACEHOLDER_PHOTO,
    contentType: "image/svg+xml",
    provenance: "upload",
    tags: ["dog", "adoption", "marbles"],
  });

  // ── The spine. Each card exists to make ONE state visible.
  const cards = [
    {
      // 1. CLEAN — the only card that can be approved right now.
      contentType: "caseStudy" as const,
      subject: "Marbles finds a family",
      title: "Marbles finds a family",
      body: "Marbles waited 214 days. On Saturday she walked out with a family who had come in 'just to look'. Two hundred and fourteen days is a long time to be patient — thank you for making the wait survivable.",
      reasonLine: "Your adoption stories get the warmest response, and this one just closed.",
      escalated: false,
      valSummary: "",
      state: "draft" as const,
      picture: photoId as string | null,
      variants: [
        { platform: "facebook_page" as const, verdict: "fit" as const, reason: "" },
        { platform: "instagram" as const, verdict: "fit" as const, reason: "" },
        {
          platform: "x" as const,
          verdict: "skipped" as const,
          // GENS-5: a skip is retained WITH its specific reason, never silently off.
          reason: "The story needs more room than X allows — it would lose the wait.",
        },
      ],
    },
    {
      // 2. HELD (GR-3) — pins in the needs-you zone, never batch-cleared.
      contentType: "relatedNews" as const,
      subject: "Flooding at the county shelter",
      title: "The flooding at the county shelter",
      body: "The county shelter took on water this week and is moving forty animals. We have space for six, and we are taking them.",
      reasonLine: "This is news your supporters will hear about anyway — better from you.",
      escalated: true,
      valSummary:
        "GR-3: this touches a distressing local event, so I'm not publishing it myself — it's yours to approve.",
      state: "draft" as const,
      picture: photoId as string | null,
      variants: [{ platform: "facebook_page" as const, verdict: "fit" as const, reason: "" }],
    },
    {
      // 3. AWAITING PICTURE (GENS-4) — the words are done, approval is honestly blocked.
      contentType: "ownEvent" as const,
      subject: "Second Saturday adoptions",
      title: "Second Saturday is coming up",
      body: "Bell Meadow Park, this Saturday, from ten. Eleven dogs and nine cats are hoping to meet you.",
      reasonLine: "Your adoption days need a week of notice to fill up.",
      escalated: false,
      valSummary: "",
      state: "awaiting_picture" as const,
      picture: null as string | null,
      variants: [
        { platform: "facebook_page" as const, verdict: "fit" as const, reason: "" },
        { platform: "instagram" as const, verdict: "fit" as const, reason: "" },
      ],
    },
  ];

  let variantCount = 0;
  for (const card of cards) {
    const itemId = randomUUID();
    await db.insert(contentItem).values({
      id: itemId,
      orgId,
      editorialState: card.state,
      contentType: card.contentType,
      subject: card.subject,
      designation: "none",
      title: card.title,
      body: card.body,
      reasonLine: card.reasonLine,
      valOutcome: card.escalated ? "escalate" : "pass",
      escalated: card.escalated,
      valSummary: card.valSummary,
      mediaAssetId: card.picture,
      isExternal: false,
      qaStatus: "n/a",
    });
    for (const v of card.variants) {
      await db.insert(channelVariant).values({
        id: randomUUID(),
        orgId,
        contentItemId: itemId,
        platform: v.platform,
        body: card.body,
        fitVerdict: v.verdict,
        fitReason: v.reason,
        deliveryState: "pending",
      });
      variantCount += 1;
    }
  }

  return { orgId, memoryEntries: memory.length, cards: cards.length, variants: variantCount };
}
