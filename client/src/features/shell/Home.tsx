/**
 * @implements UXS-1 v1 (mobile-first, exactly two layout modes)
 * @implements UXS-2 v1 (the conversation is the home's medium — a region, not a route)
 * @implements UXS-3 v1 (Ready is the home's finite spine)
 *
 * The One-Home shell (XH-12): ONE adaptive column plus a summoned pane. The
 * four regions render in a FIXED order that never changes across the home's
 * three shapes — only their density and content do (DEC-18 protects the
 * founder's spatial memory).
 *
 *   1. PINNED    — holds, publish failures, channel re-auth. Cannot scroll away,
 *                  never batch-cleared, and — uniquely — stays live and
 *                  announcing while a pane is open on desktop (DSS-24).
 *   2. READY     — the finite, ordered, clearable spine.
 *   3. CONVERSATION — the ambient stream. There is NO chat route (DEC-18).
 *   4. TERMINUS  — the honest "caught up". The stream always reaches an end.
 *
 * **No router.** Summoned views are client-local view state, not destinations:
 * a router-of-destinations would rebuild the six-surface shell DEC-18 abolished.
 * Deep links (the digest landing at the top of Ready) ride the URL hash only.
 */
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { SummonedSurface } from "../../ds/index.js";
import { Chrome, type LookInsideView } from "./Chrome.js";
import { type HomeRegion, isRegionInert, type LayoutMode, scrimRegions } from "./summon.js";

/** Reads the ONE layout-mode boundary from the theme (DEC-19/DEC-20). */
function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>(() =>
    typeof window !== "undefined" && window.matchMedia("(width >= 900px)").matches
      ? "desktop"
      : "phone",
  );
  useEffect(() => {
    const mq = window.matchMedia("(width >= 900px)");
    const on = () => setMode(mq.matches ? "desktop" : "phone");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mode;
}

/** What a summoned pane is currently showing. */
export type SummonTarget =
  | { kind: "view"; view: LookInsideView }
  | { kind: "controls" }
  | { kind: "compose" }
  | { kind: "draft"; itemId: string };

export interface HomeProps {
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  pinned?: ReactNode;
  ready?: ReactNode;
  conversation?: ReactNode;
  terminus?: ReactNode;
  /** Renders the pane's body for a target — supplied by the feature increments. */
  renderPane?: (target: SummonTarget) => { title: string; body: ReactNode };
}

/** One home region, carrying its landmark, inertness and scrim. */
function Region({
  id,
  label,
  inert,
  dimmed,
  children,
}: {
  id: HomeRegion;
  label: string;
  inert: boolean;
  dimmed: boolean;
  children: ReactNode;
}) {
  if (!children) return null;
  return (
    <section
      data-region={id}
      aria-label={label}
      // Per-region inert — never the document. This is what lets the pinned
      // zone stay live beside an open pane (DSS-24 / LRN-29).
      {...(inert ? { inert: true } : {})}
      className={`flex flex-col gap-3 ${
        dimmed
          ? "opacity-[var(--scrim-opacity)] saturate-[var(--scrim-saturate)] overflow-hidden"
          : ""
      }`}
    >
      {children}
    </section>
  );
}

/** The One-Home shell (XH-12). */
export function Home({
  paused,
  onPause,
  onResume,
  pinned,
  ready,
  conversation,
  terminus,
  renderPane,
}: HomeProps) {
  const mode = useLayoutMode();
  const [target, setTarget] = useState<SummonTarget | null>(null);
  const invokerRef = useRef<HTMLElement | null>(null);

  const summon = useCallback((next: SummonTarget) => {
    // Remember the control that opened the pane so focus can return to it.
    invokerRef.current = document.activeElement as HTMLElement | null;
    setTarget(next);
  }, []);

  const paneOpen = target !== null;
  const state = { mode, paneOpen };
  const dimmed = new Set(scrimRegions(state));
  const pane = target && renderPane ? renderPane(target) : null;
  const activeView = target?.kind === "view" ? target.view : null;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Chrome
        paused={paused}
        onPause={onPause}
        onResume={onResume}
        onOpenView={(view) => summon({ kind: "view", view })}
        onOpenControls={() => summon({ kind: "controls" })}
        onCompose={() => summon({ kind: "compose" })}
        activeView={activeView}
      />
      {/* Desktop: home column + pane BESIDE it (the pane takes the added width,
          the column holds --home-measure). Phone: the pane is a takeover. */}
      <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col gap-4 p-4 desktop:flex-row desktop:items-start">
        <main
          data-home-column
          className="flex w-full flex-col gap-4 desktop:w-[var(--home-measure)] desktop:flex-none"
        >
          <Region
            id="pinned"
            label="Needs you"
            inert={isRegionInert("pinned", state)}
            dimmed={dimmed.has("pinned")}
          >
            {pinned}
          </Region>
          <Region
            id="ready"
            label="Ready for you"
            inert={isRegionInert("ready", state)}
            dimmed={dimmed.has("ready")}
          >
            {ready}
          </Region>
          <Region
            id="conversation"
            label="Conversation"
            inert={isRegionInert("conversation", state)}
            dimmed={dimmed.has("conversation")}
          >
            {conversation}
          </Region>
          <Region
            id="terminus"
            label="Caught up"
            inert={isRegionInert("terminus", state)}
            dimmed={dimmed.has("terminus")}
          >
            {terminus}
          </Region>
        </main>
        {pane ? (
          <SummonedSurface
            open={paneOpen}
            title={pane.title}
            onDismiss={() => setTarget(null)}
            returnFocusTo={invokerRef.current}
          >
            {pane.body}
          </SummonedSurface>
        ) : null}
      </div>
    </div>
  );
}
