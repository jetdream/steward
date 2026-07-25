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
import {
  channelConnection,
  channelVariant,
  contentItem,
  externalItem,
  mediaAsset,
  memoryEntry,
  strategyDoc,
} from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client.js";

/** The address the demo founder signs in with — dev email-only login (SEC-7). */
export const DEMO_EMAIL = "demo@steward.test";

/** The e2e spec files that need a demo org of their own. */
export const DEMO_SUITES = [
  "ready",
  "draft",
  "compose",
  "controls",
  "glasswall",
  "fullloop",
] as const;

/**
 * A separate demo org per (e2e project × spec file).
 *
 * TWO reasons, and both are about concurrency rather than tidiness:
 *
 * 1. The Ready stories DISPOSE of cards, and Playwright runs desktop and phone
 *    concurrently — one org would have each project clearing the other's stack,
 *    so neither would assert what it claims.
 * 2. Dev sign-in captures a single OTP per address in memory, so two specs
 *    signing in as the SAME founder at the same moment race each other and one
 *    is left at the doorstep. (Production sign-in is Google; this is a property
 *    of the dev path only.)
 *
 * `DEMO_EMAIL` itself stays untouched for the human walkthrough.
 */
export const demoEmailFor = (project: string, suite: string): string =>
  `demo+${project}-${suite}@steward.test`;

/** The demo organization's name, as it appears in the home's greeting. */
export const DEMO_ORG_NAME = "Riverside Animal Shelter";

/** What the seed wrote, for the script's report. */
export interface SeedReport {
  orgId: string;
  memoryEntries: number;
  cards: number;
  variants: number;
  published: number;
  discoveries: number;
  channels: string;
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
 * A fixed past moment for the seeded publish log.
 *
 * Constant rather than `Date.now()`-relative so two runs produce the same
 * screen: a walkthrough that reads "3 days ago" one day and "5 days ago" the
 * next makes a reviewer wonder what changed when nothing did.
 */
const WHEN_PUBLISHED = new Date("2026-07-18T09:05:00Z");

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
  await db.delete(channelConnection).where(eq(channelConnection.orgId, orgId));
  await db.delete(externalItem).where(eq(externalItem.orgId, orgId));
  await db.delete(strategyDoc).where(eq(strategyDoc.orgId, orgId));

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

  // ── A published post, so Plan & Published has a log with a live link (PUBS-3).
  const publishedItemId = randomUUID();
  await db.insert(contentItem).values({
    id: publishedItemId,
    orgId,
    editorialState: "approved",
    contentType: "people",
    subject: "Saturday's volunteers",
    designation: "impact_gratitude",
    title: "Saturday's volunteers",
    body: "Nineteen people gave up a Saturday morning to walk dogs who needed walking. That is the whole shelter, really.",
    reasonLine: "Thanking volunteers is the rhythm that keeps them coming back.",
    valOutcome: "pass",
    escalated: false,
    valSummary: "",
    mediaAssetId: photoId,
    isExternal: false,
    qaStatus: "n/a",
  });
  await db.insert(channelVariant).values({
    id: randomUUID(),
    orgId,
    contentItemId: publishedItemId,
    platform: "facebook_page",
    body: "Nineteen people gave up a Saturday morning to walk dogs who needed walking.",
    fitVerdict: "fit",
    fitReason: "",
    deliveryState: "published",
    scheduledFor: WHEN_PUBLISHED,
    publishedUrl: "https://facebook.example/riverside/posts/demo-1",
    publishedAt: WHEN_PUBLISHED,
  });

  // ── Channel health: one CONNECTED and one EXPIRED. The expired one is the
  //    XO-4 needs-you case — a founder must never discover a dead channel
  //    silently (ONBS-4), so the walkthrough has to be able to see it.
  await db.insert(channelConnection).values([
    {
      id: randomUUID(),
      orgId,
      platform: "facebook_page",
      externalAccountRef: "demo-fb-page",
      credentialCipher: "demo-not-a-real-credential",
      status: "connected",
      statusReason: "",
      lastVerifiedAt: WHEN_PUBLISHED,
    },
    {
      id: randomUUID(),
      orgId,
      platform: "instagram",
      externalAccountRef: "demo-ig-account",
      credentialCipher: "demo-not-a-real-credential",
      status: "expired",
      statusReason: "Instagram signed me out — it does that every 60 days",
      lastVerifiedAt: WHEN_PUBLISHED,
    },
  ]);

  // ── Discoveries: read-first, untriaged, so all three dispositions are live.
  const discoveries = [
    {
      source: "Cedar Hollow Gazette",
      url: "https://gazette.example/river-cleanup",
      title: "River cleanup draws a record turnout",
      summary:
        "Four hundred volunteers cleared six tonnes of debris from the river valley last weekend.",
      relevanceRationale: "Your supporters care about the valley, and you work in it.",
    },
    {
      source: "State Humane Association",
      url: "https://humane.example/foster-shortage",
      title: "Foster homes are short statewide going into winter",
      summary: "Shelters across the state report a 30% drop in available foster placements.",
      relevanceRationale: "You run a foster programme and this is the season it matters.",
    },
  ];
  await db
    .insert(externalItem)
    .values(discoveries.map((d) => ({ id: randomUUID(), orgId, ...d, disposition: null })));

  // ── A strategy doc, so How I write is not an empty screen (STRS-1).
  await db.insert(strategyDoc).values({
    id: randomUUID(),
    orgId,
    version: 1,
    sectionA:
      "Adoption stories, the people who volunteer, and what is actually happening in the valley.",
    sectionB:
      "Warm and plain. Short sentences. Never sentimental about the animals — say what happened.",
    sectionD: "Always name the park for an adoption day. Never promise an outcome for an animal.",
    sectionE: { x: "Keep it under two sentences; link out for the story." },
  });

  return {
    orgId,
    memoryEntries: memory.length,
    cards: cards.length,
    variants: variantCount + 1,
    published: 1,
    discoveries: discoveries.length,
    channels: "1 connected, 1 expired (needs you)",
  };
}
