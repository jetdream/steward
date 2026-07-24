/**
 * Fixed domain enumerations from the data model (DM-*) — the single source for
 * these closed value sets, so no capability re-declares them. Each is a Zod enum
 * (runtime-validated at boundaries) with an inferred union type. The state
 * machines these belong to are owned by their specs; this file only pins the
 * legal values.
 */
import { z } from "zod";

/** DM-14 ChannelConnection.platform — the authorized publishing channels. */
export const ChannelPlatform = z.enum(["facebook_page", "instagram", "threads", "x"]);
export type ChannelPlatform = z.infer<typeof ChannelPlatform>;

/** DM-1 Org.newsConfig addressing mode (NWS-1, DEC-10). */
export const NewsDomainMode = z.enum(["app-path", "dedicated", "custom"]);
export type NewsDomainMode = z.infer<typeof NewsDomainMode>;

/** DM-14 ChannelConnection.status — a token expiry/revocation is first-class. */
export const ChannelConnectionStatus = z.enum(["connected", "expired", "revoked", "error"]);
export type ChannelConnectionStatus = z.infer<typeof ChannelConnectionStatus>;

/**
 * DM-5 ContentItem editorial lifecycle state. `const` tuple is the ONE source —
 * consumed by the Zod enum (boundary validation) AND the drizzle
 * `content_item.editorial_state` column (db/content.ts), keeping it a narrow union.
 */
export const editorialStates = ["draft", "awaiting_picture", "approved", "skipped"] as const;
export const EditorialState = z.enum(editorialStates);
export type EditorialState = z.infer<typeof EditorialState>;

/** DM-5 ChannelVariant delivery lifecycle state (`unpublished` is news-only). */
export const DeliveryState = z.enum(["pending", "scheduled", "published", "paused", "unpublished"]);
export type DeliveryState = z.infer<typeof DeliveryState>;

/** DM-5 ContentItem cohort-1 operator-QA gate flag (OPSS-1). `const` tuple → column. */
export const qaStatuses = ["pending-review", "cleared", "n/a"] as const;
export const QaStatus = z.enum(qaStatuses);
export type QaStatus = z.infer<typeof QaStatus>;

/** DM-11 Subscription.status — gates publishing (PUBS-1). */
export const SubscriptionStatus = z.enum(["active", "grace", "lapsed", "cancelled"]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

/** DM-16 Membership.role (BetterAuth organization plugin; ACC-2). */
export const MembershipRole = z.enum(["owner", "admin", "member"]);
export type MembershipRole = z.infer<typeof MembershipRole>;

/** DM-16 Invitation.status — the ACC-4 invite flow. */
export const InvitationStatus = z.enum(["pending", "accepted"]);
export type InvitationStatus = z.infer<typeof InvitationStatus>;

/** DM-15 User.role — platform staff only; absent for a normal founder (ADMS-1). */
export const StaffRole = z.enum(["admin", "support"]);
export type StaffRole = z.infer<typeof StaffRole>;

/** DM-17 ActivityEvent.actorKind (SEC-11 audit). */
export const ActorKind = z.enum(["user", "system", "job", "staff", "staff-act-as"]);
export type ActorKind = z.infer<typeof ActorKind>;

/**
 * DM-8 ExternalItem.disposition — the founder's post-read triage (DEC-20). A
 * `const` tuple → the nullable `external_item.disposition` column (null = not yet
 * triaged / unread in the Discoveries feed).
 */
export const externalDispositions = ["worth-a-post", "saved-for-later", "not-for-us"] as const;
export const ExternalItemDisposition = z.enum(externalDispositions);
export type ExternalItemDisposition = z.infer<typeof ExternalItemDisposition>;

/**
 * DM-2 MemoryEntry.kind (MEM-1) — the seven types as a `const` tuple: the ONE
 * source, consumed by both the Zod enum (boundary validation) and the drizzle
 * `memory_entry.kind` column (db/memory.ts) so the column stays a narrow union.
 */
export const memoryEntryKinds = [
  "fact",
  "story",
  "styleRule",
  "taboo",
  "person",
  "program",
  "event",
] as const;
export const MemoryEntryKind = z.enum(memoryEntryKinds);
export type MemoryEntryKind = z.infer<typeof MemoryEntryKind>;

/** DM-13 Topic.status — the active set is the editorial agenda (TOP-4). `const` tuple → column. */
export const topicStatuses = ["proposed", "active", "retired"] as const;
export const TopicStatus = z.enum(topicStatuses);
export type TopicStatus = z.infer<typeof TopicStatus>;

/**
 * The GEN-1 content TAXONOMY — HOW a slot frames its subject (DEC-23). A
 * cross-capability field on DM-5 ContentItem (the slot's content TYPE) chosen by
 * the planner (GENS-1) and consumed by generation (GENS-7). Internal types draw
 * on the org's own material; external types draw on the Radar (EXT-1) + saved
 * pool (EXT-5). Overlays (impact/gratitude, fundraising ask) are NOT types — they
 * are a separate slot DESIGNATION (see `SlotDesignation`), the LRN-20 split.
 */
export const contentTypes = [
  "mission",
  "founderStory",
  "caseStudy",
  "ownEvent",
  "people",
  "relatedEvent",
  "relatedNews",
  "relatedResearch",
] as const;
export const ContentType = z.enum(contentTypes);
export type ContentType = z.infer<typeof ContentType>;

/**
 * The GEN-1 v4 OVERLAY woven through the mix as a PLAN-TIME slot designation (a
 * structured attribute the mix quota counts deterministically, NOT a post-hoc
 * prose classification — the LRN-20 split). `none` = a base slot with no overlay.
 * The planner (GENS-1) assigns it; generation (GENS-7) honors it in the master.
 */
export const slotDesignations = ["none", "impact_gratitude", "fundraising_ask"] as const;
export const SlotDesignation = z.enum(slotDesignations);
export type SlotDesignation = z.infer<typeof SlotDesignation>;

/**
 * The GENS-7 VAL-chain outcome for a master (PIPE-2), persisted on DM-5
 * ContentItem: `pass` (queue-eligible) · `regenerate` (transient — a fixable
 * violation being retried) · `escalate` (forced human approval, GR-3/GR-8). A
 * `const` tuple → the `content_item.val_outcome` column. Cross-boundary: the
 * Ready surface (APR) shows why a draft is held.
 */
export const valOutcomes = ["pass", "regenerate", "escalate"] as const;
export const ValOutcome = z.enum(valOutcomes);
export type ValOutcome = z.infer<typeof ValOutcome>;

/** DM-13 Topic.provenance. `const` tuple → the `topic.provenance` column. */
export const topicProvenances = ["system-derived", "founder-added"] as const;
export const TopicProvenance = z.enum(topicProvenances);
export type TopicProvenance = z.infer<typeof TopicProvenance>;

/** DM-4 MediaAsset provenance. */
export const MediaProvenance = z.enum(["upload", "harvested"]);
export type MediaProvenance = z.infer<typeof MediaProvenance>;

/**
 * DM-19 ModelCall.operation — the LLM/search port operations (PIPE-4/PIPE-5). A
 * `const` tuple: the ONE source, consumed by the Zod enum + the drizzle
 * `model_call.operation` column so the column stays a narrow union.
 */
export const modelCallOperations = [
  "generate",
  "generateObject",
  "classify",
  "embed",
  "groundedSearch",
  "chatStep",
] as const;
export const ModelCallOperation = z.enum(modelCallOperations);
export type ModelCallOperation = z.infer<typeof ModelCallOperation>;

/** DM-19 ModelCall.outcome — how the port call resolved (PIPE-6 reliability). */
export const modelCallOutcomes = ["ok", "error"] as const;
export const ModelCallOutcome = z.enum(modelCallOutcomes);
export type ModelCallOutcome = z.infer<typeof ModelCallOutcome>;
