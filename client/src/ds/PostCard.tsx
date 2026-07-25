/**
 * @implements DSS-19 v1 (Ready-spine post card)
 * @implements DSS-20 v1 (Approve panel)
 *
 * The two COMPOSITE surfaces. Both compose the primitives above and introduce
 * **no new visual value** (GR-7) — every colour, radius, space and type role
 * here already belongs to another contract. Ported from
 * `preview/{post-card,approve-panel}.html`.
 */
import type { ChannelFitVerdict, ChannelPlatform, ContentType } from "@shared";
import type { ReactNode } from "react";
import { FitBadge, FitReason } from "./Badges.js";
import { Button } from "./Button.js";
import { Card, PhotoSlot } from "./Card.js";
import { AwaitingPicture } from "./Disposition.js";
import { ReasonLine } from "./TrustMarks.js";

/** One channel's adaptation as the card previews it (a DM-5 ChannelVariant view). */
export interface VariantSummary {
  platform: ChannelPlatform;
  verdict: ChannelFitVerdict;
  /** The specific, visible skip reason — required when `verdict` is skipped. */
  fitReason?: string;
}

/** Founder-facing labels for the GEN-1 taxonomy, off the @shared enum. */
const contentTypeLabel: Record<ContentType, string> = {
  mission: "Mission",
  founderStory: "Founder story",
  caseStudy: "Case study",
  ownEvent: "Our event",
  people: "People",
  relatedEvent: "Related event",
  relatedNews: "Related news",
  relatedResearch: "Related research",
};

export interface PostCardProps {
  contentType: ContentType;
  body: string;
  variants: readonly VariantSummary[];
  /** Why this draft exists (DSS-8) — present on every system-initiated item. */
  reason?: ReactNode;
  photoUrl?: string | undefined;
  photoAlt?: string;
  /** GENS-4: the words are done but no picture is attached yet. */
  awaitingPicture?: boolean;
  onChoosePhoto?: () => void;
  onApprove: () => void;
  onEdit?: () => void;
  onSkip?: () => void;
  onRedirect?: () => void;
  onOverrideFit?: (platform: ChannelPlatform) => void;
  /** Extra chrome the caller composes in — ProvenanceLine, CitationBlock… */
  footer?: ReactNode;
}

/**
 * DSS-19: the stream's post card.
 *
 * Approve is the card's single accent verb (DS-2) and is DISABLED while the
 * draft awaits a picture — GENS-3 is a hard invariant, so the card states the
 * block rather than letting the founder tap into a failure.
 */
export function PostCard({
  contentType,
  body,
  variants,
  reason,
  photoUrl,
  photoAlt,
  awaitingPicture = false,
  onChoosePhoto,
  onApprove,
  onEdit,
  onSkip,
  onRedirect,
  onOverrideFit,
  footer,
}: PostCardProps) {
  const skipped = variants.filter((v) => v.verdict === "skipped");
  return (
    <Card>
      {awaitingPicture ? (
        <AwaitingPicture onChooseFromLibrary={onChoosePhoto ?? (() => undefined)} />
      ) : (
        <PhotoSlot src={photoUrl} {...(photoAlt !== undefined ? { alt: photoAlt } : {})} />
      )}

      <div className="flex flex-wrap items-center gap-2 font-body text-xs font-semibold text-muted">
        <span className="rounded-pill bg-surface-warm px-2.5 py-0.5 text-fg-2">
          {contentTypeLabel[contentType]}
        </span>
      </div>

      <p className="font-body text-base text-fg">{body}</p>

      {reason ? <ReasonLine>{reason}</ReasonLine> : null}

      <div className="flex flex-wrap items-center gap-2">
        {variants.map((v) => (
          <FitBadge key={v.platform} platform={v.platform} verdict={v.verdict} />
        ))}
      </div>
      {skipped.map((v) =>
        v.fitReason ? (
          <FitReason
            key={v.platform}
            platform={v.platform}
            reason={v.fitReason}
            {...(onOverrideFit ? { onOverride: () => onOverrideFit(v.platform) } : {})}
          />
        ) : null,
      )}

      {footer}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="primary"
          onClick={onApprove}
          disabled={awaitingPicture}
          title={awaitingPicture ? "Add a photo first — the words are ready" : undefined}
        >
          Approve
        </Button>
        <span className="flex flex-wrap gap-0">
          {onEdit ? (
            <Button variant="quiet" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          {onSkip ? (
            <Button variant="quiet" onClick={onSkip}>
              Skip
            </Button>
          ) : null}
          {onRedirect ? (
            <Button variant="quiet" onClick={onRedirect}>
              Redirect…
            </Button>
          ) : null}
        </span>
      </div>
    </Card>
  );
}

/** One destination row in the approve panel. */
export interface ScheduleRow {
  platform: ChannelPlatform;
  /** Plain language — "Tue 9:05 am", never a raw timestamp. */
  when?: string;
  skipped?: boolean;
}

export interface ApprovePanelProps {
  rows: readonly ScheduleRow[];
  onApprove: () => void;
  onOverride?: (platform: ChannelPlatform) => void;
  /** Why these times ("I picked the times your followers are usually around."). */
  reason?: ReactNode;
  approveBlockedReason?: string;
}

const rowLabel: Record<ChannelPlatform, string> = {
  facebook_page: "Facebook",
  instagram: "Instagram",
  threads: "Threads",
  x: "X",
};

/**
 * DSS-20: the substrate's booking panel repurposed for post review — one
 * primary Approve CTA, the per-channel rows, and the schedule note.
 *
 * Sticky right-rail on desktop, bottom-anchored bar on phone (DS-4 targets).
 * The layout switch uses the ONLY breakpoint variant founder surfaces may use,
 * `desktop:` — two modes, no in-between (DEC-19/DEC-20).
 */
export function ApprovePanel({
  rows,
  onApprove,
  onOverride,
  reason,
  approveBlockedReason,
}: ApprovePanelProps) {
  return (
    <aside className="sticky bottom-0 flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-raised desktop:bottom-auto desktop:top-5">
      <p className="font-display text-lg font-semibold leading-tight text-fg">Ready to publish</p>
      <div>
        {rows.map((r) => (
          <div
            key={r.platform}
            className="flex items-center justify-between border-b border-border-soft py-2 font-body text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block size-2.5 rounded-pill ${r.skipped ? "bg-meta" : "bg-success"}`}
              />
              {rowLabel[r.platform]}
              {r.skipped ? " — skipped" : ""}
            </span>
            {r.skipped ? (
              onOverride ? (
                <Button variant="quiet" onClick={() => onOverride(r.platform)}>
                  override
                </Button>
              ) : null
            ) : (
              <span className="text-muted">{r.when}</span>
            )}
          </div>
        ))}
      </div>
      <Button
        variant="primary"
        onClick={onApprove}
        disabled={!!approveBlockedReason}
        title={approveBlockedReason}
        fullWidth
      >
        Approve
      </Button>
      {reason ? <ReasonLine>{reason}</ReasonLine> : null}
    </aside>
  );
}
