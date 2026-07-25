/**
 * @implements DSS-22 v1 (empty / loading narration pattern)
 *
 * Ported from `design/design-system/steward/preview/empty-states.html`.
 *
 * **There are no empty states.** Every zero-state either narrates work in
 * progress ("I'm reading your website now — first drafts in about ten minutes")
 * or proposes the next concrete step, in first-person colleague voice
 * (VAL-5/VAL-6). Skeletons and spinners are replaced by narration wherever the
 * wait is meaningful — a spinner says "the software is busy"; a colleague says
 * what they are doing and when you will have it.
 *
 * This is the shared branch every surface's loading/empty path uses, so "no
 * blank page" is a component, not a habit each screen has to remember.
 */
import type { ReactNode } from "react";
import { politeLiveRegion } from "./a11y.js";
import { typeRole } from "./type.js";

export interface NarrationProps {
  /** What Steward is doing, first person. Sentence case, no ellipsis-spinner. */
  headline: string;
  /** When it lands, or what the founder can do meanwhile. */
  detail?: ReactNode;
  /** The next concrete step — never a dead end (VAL-6). */
  action?: ReactNode;
  /**
   * Whether this narration is announced. True while work is IN PROGRESS so a
   * screen-reader user hears it resolve; false for a settled zero-state, which
   * would otherwise re-announce on every render.
   */
  live?: boolean;
}

/**
 * Work-in-progress or zero-state narration (DSS-22) — the loading branch of
 * every surface.
 */
export function Narration({ headline, detail, action, live = false }: NarrationProps) {
  return (
    <div
      className="flex flex-col items-start gap-3 rounded-lg border border-border p-8"
      {...(live ? politeLiveRegion : {})}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 flex-none items-center justify-center rounded-pill bg-fg font-body text-sm font-semibold text-bg"
        >
          S
        </span>
        <strong className="font-body text-base font-semibold text-fg">{headline}</strong>
      </div>
      {detail ? <p className="font-body text-sm text-muted">{detail}</p> : null}
      {action}
    </div>
  );
}

export interface CaughtUpProps {
  /** Consecutive weeks with a post — the G-4 rhythm read (STWS-1). */
  weeks: number;
  /** What just finished ("That's everything for this week — 5 posts heading out."). */
  summary: ReactNode;
  /** "Next up from me: …" — the terminus always points forward (VAL-6). */
  nextUp?: ReactNode;
}

/**
 * The caught-up terminus (DSS-22, XH-12 region 4). The stream ALWAYS reaches an
 * honest end — never an infinite feed (a One-Home invariant).
 *
 * The numeral is framed as steady presence, never a streak score: DEC-16
 * retired "streak" from founder-facing copy for a guilt-prone persona whose
 * promise is grace, never guilt.
 */
export function CaughtUp({ weeks, summary, nextUp }: CaughtUpProps) {
  const unit = weeks === 1 ? "week" : "weeks";
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-border p-8">
      <p className={typeRole.rhythm}>
        {weeks}
        <span className="ml-2 font-body text-base font-semibold">{unit} of steady presence</span>
      </p>
      <p className="font-body text-base text-fg">{summary}</p>
      {nextUp ? (
        <p className="flex items-baseline gap-2 font-body text-sm text-muted before:text-meta before:content-['↳']">
          {nextUp}
        </p>
      ) : null}
    </div>
  );
}
