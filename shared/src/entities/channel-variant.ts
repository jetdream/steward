/**
 * ChannelVariant (DM-5) entity type — derived from the Drizzle table (DEC-39),
 * never re-declared. A per-channel adaptation of a ContentItem master + its fit
 * verdict + delivery state. Client-safe (type-only; no drizzle at runtime).
 */
import type { InferSelectModel } from "drizzle-orm";
import type { channelVariant } from "../db/channel-variant.js";

export type ChannelVariant = InferSelectModel<typeof channelVariant>;
