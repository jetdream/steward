/**
 * @implements UXS-6 v1 (the kill switch, always one gesture from the chrome)
 * @implements UXS-4 v1 / UXS-5 v1 / UXS-8 v1 (the Look-inside cluster)
 * @implements UXS-7 v1 (Compose is an action, never a place)
 *
 * The invariant chrome of XH-12 — the part that NEVER changes across the home's
 * three shapes (day-one / weekly-visit / quiet) or between phone and desktop:
 *
 *   Pause · wordmark · the Look-inside cluster · Controls · + Compose
 *
 * Three rules make it load-bearing rather than decorative:
 * 1. **Pause is always here.** AUTS-3 is P0 `flexibility: hard` — one gesture at
 *    every trust level. It stays reachable even with a summoned pane open, which
 *    is why the chrome is never inerted and stacks at `--z-chrome`, above the
 *    pane.
 * 2. **The glass wall is one click, plain-labeled, pull-only, NEVER badged**
 *    (VAL-3, a One-Home invariant). No count, no dot, no "3 new" — badging it
 *    would turn a transparency guarantee into a notification demand.
 * 3. **Compose is an action, not a destination** (UXS-7): it opens a sheet over
 *    the home; it never navigates away.
 */
import { Button } from "../../ds/index.js";

/** The four glass-wall views, in their fixed chrome order (UXS-4/5/8). */
export const LOOK_INSIDE = [
  { id: "knowledge", label: "Knowledge" },
  { id: "how-i-write", label: "How I write" },
  { id: "plan", label: "Plan & Published" },
  { id: "discoveries", label: "Discoveries" },
] as const;

export type LookInsideView = (typeof LOOK_INSIDE)[number]["id"];

export interface ChromeProps {
  onPause: () => void;
  paused: boolean;
  onResume: () => void;
  onOpenView: (view: LookInsideView) => void;
  onOpenControls: () => void;
  onCompose: () => void;
  /** The view currently summoned, so the cluster can mark it — never a badge. */
  activeView?: LookInsideView | null;
}

/** The One-Home chrome (XH-12). Identical in both layout modes. */
export function Chrome({
  onPause,
  paused,
  onResume,
  onOpenView,
  onOpenControls,
  onCompose,
  activeView = null,
}: ChromeProps) {
  return (
    <header
      // Sticky and above the pane: XH-12's "the chrome persists" holds in BOTH
      // modes, so a phone takeover never buries the kill switch (AUTS-3).
      className="sticky top-0 flex flex-col gap-2 border-b border-border-soft bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] px-3 pb-2 pt-3 backdrop-blur-[4px]"
      style={{ zIndex: "var(--z-chrome)" }}
    >
      <div className="flex items-center gap-2">
        {paused ? (
          <Button variant="secondary" onClick={onResume} data-chrome="resume">
            Publishing paused — resume
          </Button>
        ) : (
          <Button variant="danger" onClick={onPause} data-chrome="pause">
            Pause
          </Button>
        )}
        <span className="mx-auto flex items-center gap-2 font-display text-base font-bold tracking-[var(--tracking-display)] text-fg">
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-sm bg-accent font-body text-xs font-extrabold text-accent-on"
          >
            S
          </span>
          Steward
        </span>
        <Button variant="secondary" onClick={onOpenControls} data-chrome="controls">
          Controls
        </Button>
        <Button variant="secondary" onClick={onCompose} data-chrome="compose">
          ＋ Compose
        </Button>
      </div>
      <nav aria-label="Look inside" className="flex flex-wrap gap-0.5">
        {LOOK_INSIDE.map((v) => (
          <button
            key={v.id}
            type="button"
            data-look-inside={v.id}
            aria-current={activeView === v.id ? "page" : undefined}
            onClick={() => onOpenView(v.id)}
            className={`min-h-[44px] cursor-pointer rounded-pill px-3 font-body text-xs font-semibold outline-none focus-visible:shadow-[var(--focus-ring)] ${
              activeView === v.id ? "bg-surface-warm text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {v.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
