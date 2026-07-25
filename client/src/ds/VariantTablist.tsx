/**
 * @implements DSS-25 v1 (variant tablist)
 *
 * The per-channel variant tabs inside the opened draft (XH-13). Each tab pairs
 * the channel label with its GENS-5 fit indicator, so a skipped channel reads as
 * skipped ON the tab, not only inside it. Ported from
 * `preview/variant-tablist.html`.
 *
 * Keyboard model is the WAI-ARIA tabs pattern, authored here rather than taken
 * from a library (ADR-0011): roving tabindex — the selected tab is the only tab
 * stop — with Left/Right and Home/End traversal.
 *
 * Overflow is conditioned on the CONTAINER, not the layout mode: five tabs (four
 * channels plus the news variant) overflow a narrow desktop pane sooner than a
 * phone takeover, so a mode-keyed rule would exempt exactly the case that
 * breaks. The strip scrolls with the selected tab scrolled into view.
 */
import type { ChannelFitVerdict, ChannelPlatform } from "@shared";
import { type KeyboardEvent, useEffect, useRef } from "react";

export interface VariantTab {
  platform: ChannelPlatform;
  verdict: ChannelFitVerdict;
}

const label: Record<ChannelPlatform, string> = {
  facebook_page: "Facebook",
  instagram: "Instagram",
  threads: "Threads",
  x: "X",
};

export interface VariantTablistProps {
  tabs: readonly VariantTab[];
  selected: ChannelPlatform;
  onSelect: (platform: ChannelPlatform) => void;
  /** Names the strip for assistive tech. */
  ariaLabel?: string;
}

/** The per-channel tab strip (DSS-25). */
export function VariantTablist({
  tabs,
  selected,
  onSelect,
  ariaLabel = "Channel variants",
}: VariantTablistProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  // Keep the selected tab visible when the strip overflows its container.
  useEffect(() => {
    stripRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.platform === selected);
    if (i < 0) return;
    const move = (next: number) => {
      e.preventDefault();
      const tab = tabs[next];
      if (!tab) return;
      onSelect(tab.platform);
      // Roving tabindex: focus follows selection, so the new tab is the stop.
      stripRef.current?.querySelectorAll("button")[next]?.focus();
    };
    if (e.key === "ArrowRight") move((i + 1) % tabs.length);
    else if (e.key === "ArrowLeft") move((i - 1 + tabs.length) % tabs.length);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(tabs.length - 1);
  };

  return (
    // `role="tablist"` has no native element equivalent, so the ARIA role is
    // the semantics here rather than a fallback.
    <div
      ref={stripRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {tabs.map((t) => {
        const on = t.platform === selected;
        const skipped = t.verdict === "skipped";
        return (
          <button
            key={t.platform}
            type="button"
            role="tab"
            aria-selected={on}
            // Roving tabindex: exactly one tab stop in the whole strip.
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(t.platform)}
            className={`inline-flex min-h-[44px] flex-none cursor-pointer items-center gap-2 border-b-2 px-3 font-body text-sm font-semibold outline-none focus-visible:shadow-[var(--focus-ring)] ${
              // The selected tab is marked with INK, never the accent — the
              // accent stays reserved for the panel's one primary action (DS-2).
              on ? "border-b-fg text-fg" : "border-b-transparent text-muted"
            }`}
          >
            {label[t.platform]}
            <span
              className={`rounded-pill border px-2 py-0.5 text-xs ${
                skipped
                  ? "border-border bg-surface-warm text-muted line-through"
                  : "border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[color-mix(in_srgb,var(--success)_6%,var(--surface))] text-success"
              }`}
            >
              {skipped ? "skipped" : "fit"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
