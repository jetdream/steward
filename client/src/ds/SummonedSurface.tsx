/**
 * @implements DSS-24 v1 (summoned surface — pane, sheet & tray)
 *
 * The ONE surface every summoned view uses: the opened draft (XH-13), the four
 * glass-wall views (XG-6/7/8/9), the compose sheet (XH-14) and the Controls
 * tray (XA-6). Ported from `preview/summoned-surface.html`.
 *
 * **It is a NON-MODAL `<dialog>` and that is not a style choice.** Both Radix's
 * `hideOthers()` and native `showModal()` promote to the top layer, which inerts
 * the entire document outside the pane and makes `inert = false` on the pinned
 * zone a NO-OP — verified twice in headless Chromium during the ADR-0011
 * challenge rounds (LRN-29). Under a modal pane the GR-3 holds, publish failures
 * and channel re-auth cards would go keyboard-unreachable and unannounced, and a
 * click on a visibly-undimmed pinned card would dismiss the pane instead of
 * acting on it.
 *
 * What we therefore hand-write, because a non-modal dialog provides none of it:
 * `Escape` to close · focus restore to the invoking control · initial focus into
 * the pane. What we deliberately DON'T hand-write: the focus trap — it emerges
 * from per-region `inert` (see `features/shell/summon.ts`), which is both less
 * code and the only version that can express XH-12's pinned-zone carve-out.
 */
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { Button } from "./Button.js";

export interface SummonedSurfaceProps {
  open: boolean;
  /** Names the pane for assistive tech — "Knowledge", "The draft, opened". */
  title: string;
  onDismiss: () => void;
  /** The element to return focus to on dismiss (the control that opened it). */
  returnFocusTo?: HTMLElement | null;
  /** "Back to Steward" on desktop; the phone takeover uses the same gesture. */
  backLabel?: string;
  children: ReactNode;
}

/** The summoned pane (DSS-24). Beside the home on desktop, takeover on phone. */
export function SummonedSurface({
  open,
  title,
  onDismiss,
  returnFocusTo,
  backLabel = "Back to Steward",
  children,
}: SummonedSurfaceProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const dismiss = useCallback(() => {
    onDismiss();
    // Focus restore is ours to do: a non-modal dialog does not track an invoker.
    returnFocusTo?.focus();
  }, [onDismiss, returnFocusTo]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      // `show()`, never `showModal()` — see the module header.
      if (!el.open) el.show();
      headingRef.current?.focus();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    };
    // On document, not the dialog: a non-modal dialog does not receive the
    // browser's built-in Escape handling, and focus may legitimately sit in the
    // still-live pinned zone or chrome when the founder presses it.
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      // Not `aria-modal`: the pinned zone and chrome remain legitimately
      // reachable, so claiming modality would lie to assistive tech.
      // Positioning is per layout mode, and it must OVERRIDE the UA stylesheet's
      // `position: absolute` on <dialog> — left alone, the pane floats over the
      // home column and covers the pinned zone, breaking DEC-19's "the stream
      // stays present, place kept" (caught by the E4 browser check).
      //   phone   → `fixed inset-0`: the full-screen takeover.
      //   desktop → `relative` and in-flow: a flex sibling that takes the ADDED
      //             width beside the column, so nothing is covered.
      className="fixed inset-0 m-0 flex max-h-full w-full flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-surface p-4 text-fg shadow-raised backdrop:bg-transparent open:flex desktop:relative desktop:inset-auto desktop:max-h-none desktop:w-auto desktop:max-w-[var(--pane-max)] desktop:flex-1 desktop:basis-[var(--pane-basis)]"
      style={{ zIndex: "var(--z-pane)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <Button variant="quiet" onClick={dismiss}>
          ← {backLabel}
        </Button>
        <span className="font-body text-xs text-muted">Esc</span>
      </div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-lg font-semibold tracking-[var(--tracking-display)] text-fg outline-none focus-visible:shadow-[var(--focus-ring)]"
      >
        {title}
      </h2>
      {children}
    </dialog>
  );
}
