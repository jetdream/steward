/**
 * Branded entity IDs — one per data-model entity (DM-*). Each is a Zod schema
 * (so an untrusted string is validated at a boundary) whose inferred type is a
 * distinct brand: an `OrgId` is not assignable to a `UserId`, catching
 * cross-entity ID mix-ups at compile time (conventions: branded IDs, never a
 * bare `string`; no unsafe parsing). Construct one only by parsing through its
 * schema — never with a bare cast in feature code.
 *
 * @example
 * const id = OrgId.parse(rawFromRequest); // id: OrgId
 */
import { z } from "zod";

/** Shared shape of an identifier before branding — a non-empty opaque string. */
const idBase = z.string().min(1);

/** DM-1 Org — the tenant / aggregate root. */
export const OrgId = idBase.brand<"OrgId">();
export type OrgId = z.infer<typeof OrgId>;

/** DM-2 MemoryEntry. */
export const MemoryEntryId = idBase.brand<"MemoryEntryId">();
export type MemoryEntryId = z.infer<typeof MemoryEntryId>;

/** DM-3 StrategyDoc. */
export const StrategyDocId = idBase.brand<"StrategyDocId">();
export type StrategyDocId = z.infer<typeof StrategyDocId>;

/** DM-4 MediaAsset. */
export const MediaAssetId = idBase.brand<"MediaAssetId">();
export type MediaAssetId = z.infer<typeof MediaAssetId>;

/** DM-5 ContentItem (the editorial master). */
export const ContentItemId = idBase.brand<"ContentItemId">();
export type ContentItemId = z.infer<typeof ContentItemId>;

/** DM-5 ChannelVariant (a per-destination adaptation of a ContentItem). */
export const ChannelVariantId = idBase.brand<"ChannelVariantId">();
export type ChannelVariantId = z.infer<typeof ChannelVariantId>;

/** DM-6 ChatSession. */
export const ChatSessionId = idBase.brand<"ChatSessionId">();
export type ChatSessionId = z.infer<typeof ChatSessionId>;

/** DM-7 ChatMessage. */
export const ChatMessageId = idBase.brand<"ChatMessageId">();
export type ChatMessageId = z.infer<typeof ChatMessageId>;

/** DM-8 ExternalItem (a Radar discovery). */
export const ExternalItemId = idBase.brand<"ExternalItemId">();
export type ExternalItemId = z.infer<typeof ExternalItemId>;

/** DM-9 TrustLevel (per content category). */
export const TrustLevelId = idBase.brand<"TrustLevelId">();
export type TrustLevelId = z.infer<typeof TrustLevelId>;

/** DM-10 PostMetric. */
export const PostMetricId = idBase.brand<"PostMetricId">();
export type PostMetricId = z.infer<typeof PostMetricId>;

/** DM-11 Subscription. */
export const SubscriptionId = idBase.brand<"SubscriptionId">();
export type SubscriptionId = z.infer<typeof SubscriptionId>;

/** DM-12 MessagingLink. */
export const MessagingLinkId = idBase.brand<"MessagingLinkId">();
export type MessagingLinkId = z.infer<typeof MessagingLinkId>;

/** DM-13 Topic (editorial theme). */
export const TopicId = idBase.brand<"TopicId">();
export type TopicId = z.infer<typeof TopicId>;

/** DM-14 ChannelConnection (authorized publishing channel). */
export const ChannelConnectionId = idBase.brand<"ChannelConnectionId">();
export type ChannelConnectionId = z.infer<typeof ChannelConnectionId>;

/** DM-15 User (the auth principal, distinct from the Org tenant). */
export const UserId = idBase.brand<"UserId">();
export type UserId = z.infer<typeof UserId>;

/** DM-16 Membership (User↔Org link). */
export const MembershipId = idBase.brand<"MembershipId">();
export type MembershipId = z.infer<typeof MembershipId>;

/** DM-17 ActivityEvent (per-org activity-ledger entry). */
export const ActivityEventId = idBase.brand<"ActivityEventId">();
export type ActivityEventId = z.infer<typeof ActivityEventId>;

/** DM-18 SupportSession (staff impersonation grant). */
export const SupportSessionId = idBase.brand<"SupportSessionId">();
export type SupportSessionId = z.infer<typeof SupportSessionId>;
