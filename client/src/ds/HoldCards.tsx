/**
 * The two card classes that must never be confused with each other, or with an
 * ordinary needs-approval card. Their visual inversion is deliberate (DEC-14).
 *
 * @implements DSS-15 v1 (veto-window card — TL1's quiet heads-up)
 * @implements DSS-16 v1 (HeldForApproval — GR-3's founder-facing face)
 *
 * Ported from `preview/{veto-window,held-for-approval}.html`.
 *
 * | | veto-window (DSS-15) | HeldForApproval (DSS-16) |
 * |---|---|---|
 * | says | already published, you may pull it | NOT published, it is yours to approve |
 * | register | quiet, informational, warm surface | accent edge, uppercase label |
 * | in the "N of M" count | **excluded** | **counted** |
 * | batch-approve | **excluded** (nothing to approve) | **excluded** (must be read) |
 * | trust level | TL1/TL2 only | **every** level (GR-3 overrides autonomy) |
 *
 * Both are excluded from batch-approve for OPPOSITE reasons, which is exactly
 * why they must not look alike.
 */
import type { ReactNode } from "react";
import { Button } from "./Button.js";
import { ReasonLine } from "./TrustMarks.js";

export interface VetoWindowCardProps {
  /** Plain-language deadline — "Thu 6:00 pm", never a raw timestamp. */
  until: string;
  /** Where it went, in plain language ("Facebook and Instagram"). */
  destinations: string;
  children: ReactNode;
  /** Why it published without asking — the TL1 promotion history. */
  reason: ReactNode;
  onVeto: () => void;
  onSeeWhatWentOut?: () => void;
}

/**
 * DSS-15: the TL1 heads-up. Its own quiet register — a warm surface and a
 * success dot, no accent, no urgency.
 *
 * It is EXCLUDED from progress counts and batch actions: there is nothing here
 * to approve, so counting it would inflate the founder's sense of work owed and
 * batch-approving it would be meaningless. Both actions are `quiet` for the
 * same reason — the card is informational, not a demand.
 */
export function VetoWindowCard({
  until,
  destinations,
  children,
  reason,
  onVeto,
  onSeeWhatWentOut,
}: VetoWindowCardProps) {
  return (
    <article
      data-card-class="veto-window"
      className="flex flex-col gap-3 rounded-md border border-border bg-surface-warm p-4"
    >
      <span className="inline-flex items-center gap-2 font-body text-xs font-semibold text-muted">
        <span aria-hidden="true" className="size-1.5 rounded-pill bg-success" />
        Published · you can veto until {until}
      </span>
      <p className="font-body text-base text-fg">
        {children} — went out to {destinations}.
      </p>
      <ReasonLine>{reason}</ReasonLine>
      <div className="flex flex-wrap gap-2">
        <Button variant="quiet" onClick={onVeto}>
          Veto &amp; pull it
        </Button>
        {onSeeWhatWentOut ? (
          <Button variant="quiet" onClick={onSeeWhatWentOut}>
            See what went out
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export interface HeldForApprovalCardProps {
  children: ReactNode;
  /** Why it is held — the ReasonLine names the guardrail (DSS-8/DSS-16). */
  reason: ReactNode;
  onApprove: () => void;
  onEdit?: () => void;
  onRedirect?: () => void;
  /** Blocks approval with an honest reason (e.g. GENS-4 awaiting-picture). */
  approveBlockedReason?: string;
}

/**
 * DSS-16: GR-3's founder-facing face — a sensitive draft held at EVERY trust
 * level. Pinned in the home's needs-you zone, counted in Ready, always
 * actionable, never batch-approvable.
 *
 * The accent left-edge and uppercase label are this card's claim on the
 * viewport's ONE focal (DS-2's exact set: the primary action plus at most one
 * focal element) — the Approve button holds the primary-action slot. That is
 * the intended reading, not an accent leak: a held card exists precisely to be
 * the thing you look at first.
 */
export function HeldForApprovalCard({
  children,
  reason,
  onApprove,
  onEdit,
  onRedirect,
  approveBlockedReason,
}: HeldForApprovalCardProps) {
  return (
    <article
      data-card-class="held-for-approval"
      className="flex flex-col gap-3 rounded-md border border-[color-mix(in_srgb,var(--accent)_42%,var(--border))] bg-surface p-4 shadow-[inset_3px_0_0_var(--accent)]"
    >
      <span className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-[0.05em] text-accent">
        <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent" />
        Held for your approval
      </span>
      <p className="font-body text-base text-fg">{children}</p>
      <ReasonLine>{reason}</ReasonLine>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          onClick={onApprove}
          disabled={!!approveBlockedReason}
          title={approveBlockedReason}
        >
          Approve
        </Button>
        {onEdit ? (
          <Button variant="quiet" onClick={onEdit}>
            Edit
          </Button>
        ) : null}
        {onRedirect ? (
          <Button variant="quiet" onClick={onRedirect}>
            Redirect…
          </Button>
        ) : null}
        {approveBlockedReason ? (
          <span className="font-body text-xs text-muted">{approveBlockedReason}</span>
        ) : null}
      </div>
    </article>
  );
}
