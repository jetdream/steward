/**
 * GENS-2 per-channel adaptation + the GENS-5 fit gate. For an approved master, the
 * `adapt-variant` Skill re-voices it per channel; the DETERMINISTIC technical-fit
 * check (against the PUBS-2 profile) decides fit | skipped-with-reason (LRN-20 —
 * creative adaptation is the LLM step, limit-conformance is a deterministic check).
 * A skipped variant is RETAINED with its reason so the founder can preview/override
 * (VAL-3). Semantic Strategy-fit (a section-(e) prohibition) is an LLM classifier —
 * a keyed follow-on (deferred); the technical gate is the load-bearing v0.
 *
 * @implements GENS-2 v1  (per-channel variants — master + ChannelVariant[])
 * @implements GENS-5 v1  (the channel-fit gate — technical fit, skip with reason)
 */
import { randomUUID } from "node:crypto";
import type { ChannelPlatform, ChannelVariant, OrgId } from "@shared";
import { channelVariant } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { runSkill } from "../harness/runtime.js";
import type { LlmPort } from "../ports/llm.js";
import { allChannelProfiles, type ChannelProfile, channelProfile } from "../publishing/index.js";
import { getStrategy } from "../strategy/index.js";
import { getContentItem } from "./store.js";

/** The deterministic GENS-5 technical fit against the PUBS-2 profile — a specific reason on a skip. */
export function technicalFit(
  body: string,
  profile: ChannelProfile,
  hasPicture: boolean,
): { fit: boolean; reason: string } {
  if (body.length > profile.maxChars) {
    return {
      fit: false,
      reason: `over ${profile.platform}'s ${profile.maxChars}-char limit (${body.length} chars)`,
    };
  }
  if (profile.mediaRequired && !hasPicture) {
    return { fit: false, reason: `${profile.platform} requires an image; none attached yet` };
  }
  return { fit: true, reason: "" };
}

export interface AdaptDeps {
  db: Database;
  port: LlmPort;
}

/**
 * GENS-2 + GENS-5: adapt an approved master to each target channel and persist a
 * ChannelVariant per channel with its fit verdict. Defaults to the launch channels
 * (connected-channel filtering, DM-14, lands with ONBS-4); the picture gate (GENS-3)
 * lands with media, so `mediaRequired` channels skip until then.
 */
export async function adaptContentItem(
  deps: AdaptDeps,
  orgId: OrgId,
  contentItemId: string,
  platforms: ChannelPlatform[] = allChannelProfiles().map((p) => p.platform),
): Promise<ChannelVariant[]> {
  const item = await getContentItem(deps.db, orgId, contentItemId);
  if (!item) return [];
  const strategy = await getStrategy(deps.db, orgId);
  const master = { title: item.title, body: item.body, reasonLine: item.reasonLine };
  const hasPicture = false; // GENS-3 media gate not built yet — mediaRequired channels skip
  const out: ChannelVariant[] = [];
  for (const platform of platforms) {
    const profile = channelProfile(platform);
    const channelInstruction = strategy.sectionE[platform] ?? "";
    const body = await runSkill({ orgId, skillId: "adapt-variant" }, () =>
      deps.port.adaptVariant({ master, platform, maxChars: profile.maxChars, channelInstruction }),
    );
    const verdict = technicalFit(body, profile, hasPicture);
    const [row] = await deps.db
      .insert(channelVariant)
      .values({
        id: randomUUID(),
        orgId,
        contentItemId,
        platform,
        body,
        fitVerdict: verdict.fit ? "fit" : "skipped",
        fitReason: verdict.reason,
        deliveryState: "pending",
      })
      .returning();
    if (row) out.push(row);
  }
  return out;
}

/** The variants of a ContentItem, org-confined (ACC-3) — the Ready-spine per-channel view. */
export async function listVariants(
  db: Database,
  orgId: OrgId,
  contentItemId: string,
): Promise<ChannelVariant[]> {
  return db
    .select()
    .from(channelVariant)
    .where(and(eq(channelVariant.orgId, orgId), eq(channelVariant.contentItemId, contentItemId)));
}
