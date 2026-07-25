/**
 * @implements DSS-12 v1 (awaiting-picture state)
 * @implements DSS-14 v1 (OptionalReason)
 * @implements DSS-17 v1 (CitationBlock)
 *
 * Ported from `preview/{awaiting-picture,optional-reason,citation-block}.html`.
 */
import type { ReactNode } from "react";
import { Button } from "./Button.js";
import { ReasonLine } from "./TrustMarks.js";

export interface AwaitingPictureProps {
  onChooseFromLibrary: () => void;
  /** Library suggestions ranked from Memory tags (GENS-3). */
  suggestions?: readonly { id: string; url: string; alt: string }[];
  onPick?: (id: string) => void;
  /** Why these suggestions ("These three from March look right for this story."). */
  suggestionReason?: ReactNode;
}

/**
 * DSS-12: a written-but-blocked draft (GENS-4). The words are DONE; only the
 * picture is missing.
 *
 * It renders as complete-but-blocked, never as an error: a quiet warn-tinted
 * dashed slot plus library suggestions and a next step (DS-6). The founder
 * should read "one small thing left", not "something went wrong" — the draft is
 * the system's work, and the gap is a photo only they can supply.
 */
export function AwaitingPicture({
  onChooseFromLibrary,
  suggestions = [],
  onPick,
  suggestionReason,
}: AwaitingPictureProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[color-mix(in_srgb,var(--warn)_45%,var(--border))] bg-[color-mix(in_srgb,var(--warn)_4%,var(--surface))] p-4 text-center font-body text-sm text-muted">
        <strong className="font-semibold text-fg-2">Needs a photo before it can go out</strong>
        <span>the words are ready — add one and I&apos;ll schedule it</span>
        <Button variant="secondary" onClick={onChooseFromLibrary}>
          Choose from library
        </Button>
      </div>
      {suggestions.length > 0 ? (
        <>
          <ul className="flex list-none gap-2 p-0">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onPick?.(s.id)}
                  className="cursor-pointer overflow-hidden rounded-sm outline-none focus-visible:shadow-[var(--focus-ring)]"
                >
                  <img src={s.url} alt={s.alt} className="h-12 w-16 object-cover" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
          {suggestionReason ? <ReasonLine>{suggestionReason}</ReasonLine> : null}
        </>
      ) : null}
    </div>
  );
}

/** The canned one-tap reasons, shared by skip, veto and radar marks. */
export const OPTIONAL_REASONS = ["Not now", "Not our style", "Wrong facts"] as const;
export type OptionalReasonChoice = (typeof OPTIONAL_REASONS)[number];

export interface OptionalReasonProps {
  /** What just happened — "Skipped.", "Vetoed.", "Marked not-for-us." */
  action: string;
  onChoose: (reason: OptionalReasonChoice) => void;
  /** Opens the free-text path ("Tell me…") — the enrichment conversation. */
  onTellMore?: () => void;
  onDismiss?: () => void;
}

/**
 * DSS-14: the one-tap, dismissible reason affordance shared by Skip, veto and
 * radar marks.
 *
 * It appears AFTER the action completes and never blocks it — the card is
 * already gone from the count, so answering is a gift, never a toll (XH-9).
 * Feeds Memory (MEMS-1) when answered; costs nothing when ignored.
 */
export function OptionalReason({ action, onChoose, onTellMore, onDismiss }: OptionalReasonProps) {
  return (
    <div className="flex max-w-[460px] flex-col gap-3 rounded-md border border-border bg-surface p-4">
      <p className="font-body text-sm text-fg">
        {action} Mind saying why? <span className="text-muted">(optional — it helps me learn)</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONAL_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChoose(r)}
            className="min-h-[44px] cursor-pointer rounded-pill border border-border bg-surface px-3.5 font-body text-sm font-medium text-fg-2 outline-none hover:border-fg focus-visible:shadow-[var(--focus-ring)]"
          >
            {r}
          </button>
        ))}
        {onTellMore ? (
          <button
            type="button"
            onClick={onTellMore}
            className="min-h-[44px] cursor-pointer rounded-pill border border-border bg-surface px-3.5 font-body text-sm font-medium text-fg-2 outline-none hover:border-fg focus-visible:shadow-[var(--focus-ring)]"
          >
            Tell me…
          </button>
        ) : null}
        {onDismiss ? (
          <Button variant="quiet" onClick={onDismiss}>
            No thanks
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export interface CitationBlockProps {
  /** The publication + date, e.g. "County Wildlife Report, March 2026". */
  source: string;
  url: string;
}

/**
 * DSS-17: GR-5's visual form. Every external-content post carries its source
 * and the org's OWN framing — never rehashed news.
 *
 * One treatment shared by the Ready-spine external card and the public news
 * article, so the citation a founder approves is the citation a donor reads.
 * (In `@news` it is re-expressed as an Astro component per ADR-0004 — the
 * tokens are shared, the component is not imported across the boundary.)
 */
export function CitationBlock({ source, url }: CitationBlockProps) {
  return (
    <div className="flex flex-col gap-1 rounded-sm border-l-[3px] border-l-[color-mix(in_srgb,var(--accent)_40%,var(--border))] bg-surface-warm px-4 py-3 font-body text-sm">
      <span className="font-semibold text-fg-2">{source}</span>
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="text-accent underline decoration-dotted underline-offset-2 outline-none focus-visible:shadow-[var(--focus-ring)]"
      >
        {url}
      </a>
    </div>
  );
}
