/**
 * The three quiet trust marks — the DS-5 chrome that makes the system legible
 * without shouting. All are one muted line; none is ever an alert.
 *
 * @implements DSS-8 v1  (ReasonLine — why this exists)
 * @implements DSS-11 v1 (AssumedNote — what was defaulted, not asked)
 * @implements DSS-13 v1 (ProvenanceLine — what it was built from)
 *
 * Ported from `preview/{reason-line,assumed-note,provenance-line}.html`.
 */
import type { ReactNode } from "react";

export interface ReasonLineProps {
  children: ReactNode;
}

/**
 * DSS-8: one quiet line under every system-initiated item saying WHY it exists,
 * in first-person colleague voice (VAL-5).
 *
 * The rule this component exists to make unforgettable: **no request, draft, or
 * nudge ships without one.** A proactive system that cannot say why it acted is
 * indistinguishable from one that acted at random.
 */
export function ReasonLine({ children }: ReasonLineProps) {
  return (
    <p className="flex items-baseline gap-2 font-body text-sm text-muted before:text-meta before:content-['↳']">
      {children}
    </p>
  );
}

export interface AssumedNoteProps {
  children: ReactNode;
  /** The one-tap correction. Its absence would make the marker a dead end. */
  onCorrect: () => void;
  correctLabel?: string;
}

/**
 * DSS-11: a visible marker on anything the system DEFAULTED rather than asked
 * (MEM-2, VAL-3), with a one-tap correction path.
 *
 * Never a silent guess. The warn tint is deliberately quiet — this is a
 * disclosure, not a problem.
 */
export function AssumedNote({
  children,
  onCorrect,
  correctLabel = "Not right?",
}: AssumedNoteProps) {
  return (
    <p className="inline-flex items-baseline gap-2 rounded-sm border border-[color-mix(in_srgb,var(--warn)_30%,var(--border))] bg-[color-mix(in_srgb,var(--warn)_6%,var(--surface))] px-3 py-2 font-body text-sm">
      <span className="text-xs font-semibold lowercase text-warn">assumed</span>
      <span className="text-fg">
        {children}{" "}
        <button
          type="button"
          onClick={onCorrect}
          className="cursor-pointer text-fg underline decoration-dotted underline-offset-2 outline-none focus-visible:shadow-[var(--focus-ring)]"
        >
          {correctLabel}
        </button>
      </span>
    </p>
  );
}

/** One Memory/Radar source a draft was grounded on. */
export interface ProvenanceSource {
  label: string;
  /** Opens the entry in Memory. Omit for a source with no tap-through. */
  onOpen?: () => void;
}

export interface ProvenanceLineProps {
  sources: readonly ProvenanceSource[];
  /** Appends "— external" (an external-sourced draft's source lives outside Memory). */
  external?: boolean;
}

/**
 * DSS-13: the Memory sources a draft was grounded on — "Built from your update
 * last Tuesday · your website".
 *
 * This is the weeks-1–8 trust surface: it is what makes *"did it just make that
 * up?"* a question the founder never has to ask (DEC-8, VAL-3).
 */
export function ProvenanceLine({ sources, external = false }: ProvenanceLineProps) {
  if (sources.length === 0) return null;
  return (
    <p className="flex flex-wrap items-baseline gap-2 font-body text-xs text-meta">
      <span>Built from</span>
      {sources.map((s, i) => (
        <span key={s.label} className="flex items-baseline gap-2">
          {s.onOpen ? (
            <button
              type="button"
              onClick={s.onOpen}
              className="cursor-pointer text-muted underline decoration-dotted underline-offset-2 outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              {s.label}
            </button>
          ) : (
            <span className="text-muted">{s.label}</span>
          )}
          {i < sources.length - 1 ? <span aria-hidden="true">·</span> : null}
        </span>
      ))}
      {external ? <span>— external</span> : null}
    </p>
  );
}
