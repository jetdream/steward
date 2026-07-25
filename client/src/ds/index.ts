/**
 * @module @client/ds — the Steward design system, realized (DSS-1..25)
 *
 * The founder-surface component inventory GR-7 v3 binds every screen to. One
 * file per DSS contract, each carrying its `@implements DSS-n` marker; the
 * visual source of truth for each is its card in
 * `design/design-system/steward/preview/`.
 *
 * ADR-0011 / DEC-42: founder surfaces take NO ShadCN and NO Radix. Behaviour
 * comes from native platform primitives (a non-modal `<dialog>.show()` plus
 * per-region `inert` for the summoned pane, a roving-tabindex tablist);
 * appearance comes from here. Internal staff tools keep their DEC-35 shadcn
 * allowance — the scope is by surface, not by package.
 *
 * E1 landed the FOUNDATIONS (DSS-1..4); E2 the PRIMITIVES (DSS-5/6/7/21/22);
 * E3 the TRUST CHROME + composites (DSS-8..20). The shell surfaces
 * (DSS-24/25 — the summoned pane and the variant tablist) follow with E4.
 */

// DSS-1 — the token source is `../index.css`, which imports the steward theme.
// It has no runtime export; the marker lives in that file.

export {
  assertiveLiveRegion,
  focusRing,
  inertWhen,
  minTarget,
  politeLiveRegion,
  regionLandmark,
  srOnly,
  tapTarget,
} from "./a11y.js";
export {
  ACCENT_FOCAL_ATTR,
  ACCENT_FOCAL_SELECTOR,
  accentFocal,
  assertSingleAccent,
  countAccentFocals,
} from "./accent.js";
export {
  ArticleLinkBadge,
  type ArticleLinkBadgeProps,
  FitBadge,
  type FitBadgeProps,
  FitReason,
  type FitReasonProps,
  KillSwitchRow,
  type KillSwitchRowProps,
  TrustLevelIndicator,
  type TrustLevelIndicatorProps,
} from "./Badges.js";
export { Button, type ButtonProps, type ButtonVariant } from "./Button.js";
export {
  Card,
  type CardElevation,
  type CardProps,
  PhotoSlot,
  type PhotoSlotProps,
} from "./Card.js";
export {
  type ChatAuthor,
  ChatMessage,
  type ChatMessageProps,
  InlineWorkCard,
  type InlineWorkCardProps,
} from "./ChatMessage.js";
export {
  AwaitingPicture,
  type AwaitingPictureProps,
  CitationBlock,
  type CitationBlockProps,
  OPTIONAL_REASONS,
  OptionalReason,
  type OptionalReasonChoice,
  type OptionalReasonProps,
} from "./Disposition.js";
export {
  TextArea,
  type TextAreaProps,
  TextField,
  type TextFieldProps,
  Toggle,
  type ToggleProps,
} from "./Field.js";
export {
  HeldForApprovalCard,
  type HeldForApprovalCardProps,
  VetoWindowCard,
  type VetoWindowCardProps,
} from "./HoldCards.js";
export { CaughtUp, type CaughtUpProps, Narration, type NarrationProps } from "./Narration.js";
export {
  ApprovePanel,
  type ApprovePanelProps,
  PostCard,
  type PostCardProps,
  type ScheduleRow,
  type VariantSummary,
} from "./PostCard.js";
export {
  AssumedNote,
  type AssumedNoteProps,
  ProvenanceLine,
  type ProvenanceLineProps,
  type ProvenanceSource,
  ReasonLine,
  type ReasonLineProps,
} from "./TrustMarks.js";
export { type TextTone, type TypeRole, textTone, typeRole } from "./type.js";
