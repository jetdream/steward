/**
 * The per-channel badges and the autonomy indicator.
 *
 * @implements DSS-9 v1  (FitBadge — fit | skipped-with-reason)
 * @implements DSS-18 v1 (ArticleLink — which variants carry the news link)
 * @implements DSS-10 v1 (TrustLevel indicator + the always-present kill switch)
 *
 * Ported from `preview/{fit-badge,article-link,trust-level}.html`.
 */
import type { ChannelFitVerdict, ChannelPlatform, TrustLevelValue } from "@shared";
import { Button } from "./Button.js";
import { ReasonLine } from "./TrustMarks.js";

/** Short channel labels. Derived from the @shared enum — never a local union. */
const channelLabel: Record<ChannelPlatform, string> = {
  facebook_page: "FB",
  instagram: "IG",
  threads: "Threads",
  x: "X",
};

const badgeBase =
  "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 font-body text-xs font-semibold";

export interface FitBadgeProps {
  platform: ChannelPlatform;
  verdict: ChannelFitVerdict;
}

/**
 * DSS-9: the per-channel chip. `fit` carries a subtle success tint; `skipped`
 * reads as struck-through and muted.
 *
 * The badge shows the VERDICT only — the skip's *reason* belongs in the
 * accompanying `FitReason`, because GENS-5 requires a specific, visible reason
 * and a chip is too small to carry one honestly.
 */
export function FitBadge({ platform, verdict }: FitBadgeProps) {
  const fit = verdict === "fit";
  return (
    <span
      className={`${badgeBase} ${
        fit
          ? "border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[color-mix(in_srgb,var(--success)_6%,var(--surface))] text-success"
          : "border-border bg-surface-warm text-muted line-through"
      }`}
    >
      {channelLabel[platform]}
      <span className="sr-only">{fit ? " — fits" : " — skipped"}</span>
    </span>
  );
}

export interface FitReasonProps {
  platform: ChannelPlatform;
  reason: string;
  /** Fit is always overridable by the founder (DSS-9/GENS-5). */
  onOverride?: () => void;
}

/** The visible, specific skip reason that must accompany a skipped FitBadge. */
export function FitReason({ platform, reason, onOverride }: FitReasonProps) {
  return (
    <ReasonLine>
      skipped {channelLabel[platform]}: {reason}
      {onOverride ? (
        <>
          {" — "}
          <button
            type="button"
            onClick={onOverride}
            className="cursor-pointer underline decoration-dotted underline-offset-2 outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            override for this post
          </button>
        </>
      ) : null}
    </ReasonLine>
  );
}

export interface ArticleLinkBadgeProps {
  platform: ChannelPlatform;
}

/**
 * DSS-18: FitBadge's sibling — this variant carries a link to the org's news
 * article, because the channel is length-limited.
 *
 * Never rendered for an unpublished article: a badge promising a link to
 * nothing is worse than no badge.
 */
export function ArticleLinkBadge({ platform }: ArticleLinkBadgeProps) {
  return (
    <span
      className={`${badgeBase} border-[color-mix(in_srgb,var(--accent)_32%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))] text-accent`}
    >
      {channelLabel[platform]} · links to your article
    </span>
  );
}

/** The founder-facing label for each level — never the internal code (DEC-16). */
const trustLabel: Record<TrustLevelValue, string> = {
  TL0: "I ask first",
  TL1: "I publish, you can veto for 24h",
  TL2: "Full autopilot",
};

export interface TrustLevelIndicatorProps {
  current: TrustLevelValue;
  onSelect?: (level: TrustLevelValue) => void;
}

/**
 * DSS-10: the per-category autonomy state, rendered where it acts and editable
 * in Controls.
 *
 * Founder-facing copy uses the plain-language labels, not the TL0/TL1/TL2 codes
 * — DEC-16 kept the codes internal. The codes still ride along in `aria-label`
 * and the value, so the machine layer stays unambiguous.
 */
export function TrustLevelIndicator({ current, onSelect }: TrustLevelIndicatorProps) {
  const levels: TrustLevelValue[] = ["TL0", "TL1", "TL2"];
  return (
    // A real <fieldset>: the levels are one exclusive choice, so the native
    // grouping element carries the semantics rather than role="group" (DS-4).
    <fieldset className="flex gap-2 border-0 p-0">
      <legend className="sr-only">Autonomy level</legend>
      {levels.map((level) => {
        const on = level === current;
        const cls = `flex-1 rounded-pill border px-3 py-2 text-center font-body text-xs font-semibold ${
          on
            ? "border-accent bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))] text-accent"
            : "border-border text-muted"
        }`;
        return onSelect ? (
          <button
            key={level}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(level)}
            className={`${cls} min-h-[44px] cursor-pointer outline-none focus-visible:shadow-[var(--focus-ring)]`}
          >
            {trustLabel[level]}
          </button>
        ) : (
          <span key={level} className={cls}>
            {trustLabel[level]}
          </span>
        );
      })}
    </fieldset>
  );
}

export interface KillSwitchRowProps {
  onPause: () => void;
  paused?: boolean;
  onResume?: () => void;
}

/**
 * DSS-10's inseparable other half: the kill switch (AUT-3). It pairs with the
 * TrustLevel indicator because autonomy is only safe when it is revocable.
 *
 * It is always ONE gesture and always `danger` — AUTS-3 is P0 `flexibility:
 * hard` ("always reachable at every Trust Level"), so this row is never
 * conditional on the current level and never buried behind a confirm step.
 */
export function KillSwitchRow({ onPause, paused = false, onResume }: KillSwitchRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
      <span className="font-body text-sm">
        <strong className="font-semibold text-fg">Kill switch</strong>
        <br />
        <span className="text-muted">
          {paused ? "publishing is paused — nothing goes out" : "pauses all publishing instantly"}
        </span>
      </span>
      {paused && onResume ? (
        <Button variant="secondary" onClick={onResume}>
          Resume publishing
        </Button>
      ) : (
        <Button variant="danger" onClick={onPause}>
          Pause everything
        </Button>
      )}
    </div>
  );
}
