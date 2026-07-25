/**
 * @implements DSS-2 v1 (accent & colour-role discipline)
 *
 * The one accent (terracotta, a token) is reserved for the PRIMARY action, the
 * active-nav indicator, and at most ONE focal element per viewport. Everything
 * else resolves from the grayscale ramp; status colour stays under ~5% of any
 * surface. DSS-2 calls for "a utility enforcing one accent focal per viewport"
 * — this is it.
 *
 * The enforcement is deliberately split, honestly:
 *   - `assertSingleAccent` is a DEV-ONLY runtime check. It counts rendered
 *     accent focals in a container and warns; it never throws in production and
 *     never changes what the user sees.
 *   - The DURABLE check is the e2e assertion (E5) that runs this over the real
 *     shell. A dev-only console warning is a smoke alarm, not a gate — LRN-29's
 *     "prose rules are hope" applies to dev warnings too.
 *
 * Why a count rather than a lint rule: the violation is a RENDERED-STATE
 * property (two accent things visible at once), not a source property — a card
 * may legitimately own the accent in one shape and not another.
 */

/** Marks the element that carries this viewport's single accent focal (DSS-2). */
export const ACCENT_FOCAL_ATTR = "data-accent-focal";

/** The selector the guard counts. Exported so the e2e suite asserts the same thing. */
export const ACCENT_FOCAL_SELECTOR = `[${ACCENT_FOCAL_ATTR}]`;

/** Props spread onto the element that owns the accent — the primary action of a surface. */
export const accentFocal = { [ACCENT_FOCAL_ATTR]: "" } as const;

/**
 * Count the accent focals currently rendered inside `root`. Pure over the DOM —
 * the e2e suite calls this too, so dev and test measure the identical thing.
 */
export function countAccentFocals(root: ParentNode): number {
  return root.querySelectorAll(ACCENT_FOCAL_SELECTOR).length;
}

/**
 * DEV-ONLY: warn when a surface renders more than one accent focal (DSS-2).
 * No-ops in production. Returns the count so callers/tests can assert on it.
 */
export function assertSingleAccent(root: ParentNode, surface: string): number {
  const count = countAccentFocals(root);
  if (import.meta.env.DEV && count > 1) {
    console.warn(
      `[DSS-2] ${surface} renders ${count} accent focals; exactly one is allowed. ` +
        `Demote the others to secondary/quiet (the accent marks THE primary action).`,
    );
  }
  return count;
}
