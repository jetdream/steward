/**
 * @implements DSS-5 v1 (button contract)
 *
 * Ported from `design/design-system/steward/preview/buttons.html`. Four
 * variants, and which one you pick is a governed choice, not taste:
 *
 * - `primary` — THE accent. One per surface: the screen's single primary verb
 *   (Approve or its equivalent, DS-2/VAL-6). It carries the `accentFocal`
 *   marker automatically, so the DSS-2 guard can count it.
 * - `secondary` — the pill outline: Edit, Choose a photo.
 * - `quiet` — low emphasis: Skip, Not now. (The built system names this
 *   `quiet`, not "ghost" — DESIGN.md / the DSS challenge record.)
 * - `danger` — reserved for the kill switch family and destructive confirms
 *   (AUT-3). Never a general-purpose red.
 *
 * Heights come from the DS-4 ≥44px target floor rather than the preview's raw
 * `14px`/`10px` padding — the same rendered height, expressed as the spec
 * constant it actually is, so no raw px enters a component (DSS-1).
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { minTarget } from "./a11y.js";
import { accentFocal } from "./accent.js";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

/** Base: layout, the token-driven transition, and the DSS-4 ink focus ring. */
// NOTE: the base declares `border` (width) but NOT a border-COLOUR. Tailwind
// emits all border-color utilities in one layer, so a `border-transparent` here
// would win over a variant's `border-danger` by source order and silently erase
// the destructive outline — each variant therefore owns its own border colour.
const base = [
  "inline-flex items-center justify-center gap-2 font-body font-medium",
  "cursor-pointer border select-none",
  "transition-[background-color,transform] duration-fast ease-standard",
  "outline-none focus-visible:shadow-[var(--focus-ring)]",
  // A disabled control keeps its footprint but stops reading as actionable.
  "disabled:cursor-default disabled:bg-surface-warm disabled:text-meta",
  "disabled:border-transparent disabled:active:scale-100",
].join(" ");

const variants: Record<ButtonVariant, string> = {
  primary: [
    "bg-accent text-accent-on border-transparent rounded-sm px-6 text-base",
    "hover:bg-accent-hover active:bg-accent-active active:scale-[0.96]",
  ].join(" "),
  secondary: [
    "bg-surface text-fg border-border rounded-pill px-4 text-sm",
    "hover:bg-surface-warm",
  ].join(" "),
  quiet:
    "text-muted border-transparent rounded-sm px-3 text-sm hover:text-fg hover:bg-surface-warm",
  danger: "bg-surface text-danger border-danger rounded-sm px-4 text-sm hover:bg-surface-warm",
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  /**
   * An in-flight action. Renders `aria-busy` and blocks re-entry; the label
   * swaps to `pendingLabel` when given. Deliberately NOT a spinner — DSS-22
   * replaces spinners with narration wherever the wait is meaningful.
   */
  loading?: boolean;
  pendingLabel?: string;
  /** A square control whose label lives in `aria-label` (still ≥44px, DS-4). */
  iconOnly?: boolean;
  children: ReactNode;
}

/** The one button primitive every founder surface uses (DSS-5). */
export function Button({
  variant = "secondary",
  loading = false,
  pendingLabel,
  iconOnly = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  // The accent marks exactly one focal per surface (DSS-2) — attach the marker
  // here so a surface cannot forget it and quietly defeat the guard.
  const focal = variant === "primary" ? accentFocal : {};
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${minTarget} ${variants[variant]} ${iconOnly ? "aspect-square px-0" : ""}`}
      {...focal}
      {...rest}
    >
      {loading && pendingLabel ? pendingLabel : children}
    </button>
  );
}
