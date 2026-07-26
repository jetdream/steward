/**
 * @module @shared/labels — founder-facing labels for the DM enums
 *
 * The ONE place a founder-visible word is derived from an enum value. The
 * glossary is explicit that "code identifiers, DB entities, and UI copy use
 * these names", and the constitution requires client labels to be rendered OFF
 * `shared/src/enums.ts` rather than re-declared per component — so the maps live
 * here, beside the enums they key, and both `@client` and `@backend` read them.
 *
 * WHY THIS FILE EXISTS. The Phase F audit found nine sites rendering a raw enum
 * straight into the DOM: a founder read `awaiting picture`, `facebook_page`,
 * `STYLERULE`, `identity` and `caseStudy, impact_gratitude` as if they were
 * English. Each site had independently decided whether to humanise, and the ones
 * that forgot were invisible to every gate — a `string` renders just as happily
 * as a sentence. Keying each map to its `const` tuple makes an unlabelled
 * member a TYPE ERROR instead of a leak (LRN-35's "wire it so the wrong thing is
 * not writable by accident").
 *
 * VOCABULARY IS GOVERNED, NOT TASTE. DEC-16 fixed several of these words by
 * decision: trust levels shed their TL codes in founder-facing labels, and
 * "Radar" is "Discoveries". Changing a label here is a vocabulary change and
 * belongs in the glossary first.
 */
import type {
  ChannelPlatform,
  ContentType,
  EditorialState,
  ExternalItemDisposition,
  GapCategory,
  MemoryEntryKind,
} from "./enums.js";

/**
 * A total map from every member of an enum to its founder-facing label. The
 * `Record` is exhaustive by construction — adding an enum member without a label
 * fails typecheck, which is the point.
 */
export type LabelMap<T extends string> = Readonly<Record<T, string>>;

/** Editorial state, as the founder reads it. Never the raw underscore form. */
export const editorialStateLabels: LabelMap<EditorialState> = {
  draft: "Waiting for you",
  // GENS-4 is explicit that this is "complete but blocked, NEVER an error" — the
  // label states the missing thing, not a fault.
  awaiting_picture: "Needs a photo",
  approved: "Approved",
  skipped: "Skipped",
};

/** Channel platform, full name. Short forms for chips live with the badge component. */
export const channelPlatformLabels: LabelMap<ChannelPlatform> = {
  facebook_page: "Facebook",
  instagram: "Instagram",
  threads: "Threads",
  x: "X",
};

/**
 * Memory-entry kind. These name what Steward has learned, in the founder's
 * words — `styleRule` and `taboo` are internal shapes, not things a founder says.
 */
export const memoryEntryKindLabels: LabelMap<MemoryEntryKind> = {
  fact: "Fact",
  story: "Story",
  styleRule: "How you sound",
  taboo: "Something I never do",
  person: "Person",
  program: "Program",
  event: "Event",
};

/** The GEN-1 taxonomy type, as it appears on a card. */
export const contentTypeLabels: LabelMap<ContentType> = {
  mission: "Mission",
  founderStory: "Founder story",
  caseStudy: "Case study",
  ownEvent: "Our event",
  people: "People",
  relatedEvent: "Related event",
  relatedNews: "Related news",
  relatedResearch: "Related research",
};

/** Discoveries triage verdicts, as the founder tapped them. */
export const externalDispositionLabels: LabelMap<ExternalItemDisposition> = {
  "worth-a-post": "Worth a post",
  "saved-for-later": "Saved for later",
  "not-for-us": "Not for us",
};

/**
 * The ONB-3 gap categories, as the founder reads them in the
 * "help me understand you" list (XG-3/XG-6) — the internal keys are coverage
 * dimensions, not phrases anyone would say out loud.
 */
export const gapCategoryLabels: LabelMap<GapCategory> = {
  identity: "Who you are",
  programs: "What you do",
  people: "Your people",
  stories: "Your stories",
  style: "How you sound",
  calendar: "What's coming up",
};
