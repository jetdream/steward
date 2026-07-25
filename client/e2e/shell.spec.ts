/**
 * The One-Home shell stories — the E4 browser assertions, made permanent.
 *
 * Every assertion here is a RENDERED-STATE fact — focus landed, a region is
 * reachable, a click hits what it looks like it hits. None of them is visible to
 * typecheck, lint, or a unit test, and US-3/US-5 in particular are the two the
 * ADR-0011 challenger rounds proved a modal pane would silently break.
 *
 * Each `@validates` marker sits on its OWN test block, not in this header:
 * a header marker keeps a story "evidenced" even after its test body is
 * deleted, which is evidence of nothing.
 */
import { expect, type Page, test } from "@playwright/test";

/** The dev-only shell harness (see `features/shell/ShellPreview.tsx`). */
const SHELL = "/#shell";

/** Is this project running at desktop width? Mirrors the ONE theme breakpoint. */
async function isDesktop(page: Page): Promise<boolean> {
  return page.evaluate(() => window.matchMedia("(width >= 900px)").matches);
}

test.beforeEach(async ({ page }) => {
  await page.goto(SHELL);
  await expect(page.locator("[data-region='pinned']")).toBeVisible();
});

/** @validates US-1 (the home always presents the same skeleton) */
test("US-1: the chrome and the four regions are always in the same order", async ({ page }) => {
  await expect(page.locator("[data-chrome='pause']")).toBeVisible();
  await expect(page.locator("[data-chrome='controls']")).toBeVisible();
  await expect(page.locator("[data-chrome='compose']")).toBeVisible();

  const regions = await page
    .locator("[data-region]")
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.region));
  expect(regions).toEqual(["pinned", "ready", "conversation", "terminus"]);

  const links = page.locator("[data-look-inside]");
  await expect(links).toHaveCount(4);
  // Pull-only means NEVER badged. A digit check alone is not enough — a dot is
  // a badge too, and the challenger proved that gap by adding one and staying
  // green. Assert BOTH: no digit in the label, and no element inside a link
  // other than its own text.
  for (const text of await links.allTextContents()) {
    expect(text).not.toMatch(/\d/);
  }
  expect(await links.evaluateAll((els) => els.filter((e) => e.children.length > 0).length)).toBe(0);
});

/**
 * @validates US-2 (a summoned view opens beside the home without losing her place)
 * @validates US-3 (a held card stays reachable while a pane is open)
 */
test("US-2/US-3: the pane opens beside the home and the pinned zone stays live", async ({
  page,
}) => {
  test.skip(
    !(await isDesktop(page)),
    "summon-beside is the desktop mode; phone is US-5's takeover",
  );

  await page.locator("[data-look-inside='knowledge']").click();
  const pane = page.locator("dialog[open]");
  await expect(pane).toBeVisible();

  // The pane must NOT be in the top layer. This is the crux: a top-layer surface
  // inerts the whole document and makes the pinned carve-out a no-op (LRN-29).
  expect(await pane.evaluate((d: HTMLDialogElement) => d.matches(":modal"))).toBe(false);

  // US-2 — beside, not over, AND at its FULL READABLE WIDTH. Position alone is
  // not enough: the challenger shrank the column to 120px and this test stayed
  // green, so assert the width against the token the story actually promises.
  const col = await page.locator("[data-home-column]").boundingBox();
  const box = await pane.boundingBox();
  expect(col && box && box.x >= col.x + col.width - 1).toBe(true);
  const measure = await page.evaluate(() =>
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--home-measure"),
    ),
  );
  expect(Math.round(col?.width ?? 0)).toBe(Math.round(measure));

  // Exactly the stream is inert; the pinned zone is excluded.
  const inert = await page
    .locator("[data-region][inert]")
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.region));
  expect(inert).toEqual(["ready", "conversation", "terminus"]);

  // The stream is DIMMED, not hidden — "place kept" means still legible. The
  // challenger set opacity to 0 and this stayed green, so bound it on both sides.
  const streamOpacity = await page
    .locator("[data-region='ready']")
    .evaluate((e) => Number.parseFloat(getComputedStyle(e).opacity));
  expect(streamOpacity).toBeGreaterThan(0);
  expect(streamOpacity).toBeLessThan(1);

  // US-3 — the pinned zone is undimmed, focusable, and actually hit-testable.
  const pinned = page.locator("[data-region='pinned']");
  await expect(pinned).not.toHaveAttribute("inert", /.*/);
  expect(await pinned.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");

  const pinnedButton = pinned.getByRole("button").first();
  await pinnedButton.focus();
  await expect(pinnedButton).toBeFocused();
  // The click must land on the button itself — under a modal pane it would hit
  // the backdrop and dismiss the pane instead of acting on the held card.
  expect(
    await pinnedButton.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    }),
  ).toBe(true);
});

/** @validates US-4 (leaving a pane returns her exactly where she was) */
test("US-4: Escape closes the pane and returns focus to the invoking control", async ({ page }) => {
  const invoker = page.locator("[data-look-inside='plan']");
  await invoker.focus();
  await invoker.press("Enter");
  await expect(page.locator("dialog[open]")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(invoker).toBeFocused();
  // Dismissal must also lift every inert flag — a stranded `inert` would leave
  // the stream permanently unreachable with no visible cause.
  await expect(page.locator("[data-region][inert]")).toHaveCount(0);
});

/** @validates US-5 (the kill switch is one gesture away, even under a takeover) */
test("US-5: the kill switch stays one gesture away with a pane open", async ({ page }) => {
  await page.locator("[data-look-inside='discoveries']").click();
  await expect(page.locator("dialog[open]")).toBeVisible();

  const pause = page.locator("[data-chrome='pause']");
  // Never inert, in either mode — AUT-3 is a hard guardrail, and a phone
  // takeover is exactly where a pane could plausibly bury it.
  await expect(page.locator("header[inert]")).toHaveCount(0);
  await pause.focus();
  await expect(pause).toBeFocused();
  // Focusing the chrome must not have dismissed the pane.
  await expect(page.locator("dialog[open]")).toBeVisible();

  if (!(await isDesktop(page))) {
    // Phone: the takeover covers the home, so the chrome must paint ABOVE it
    // (--z-chrome > --z-pane) or Pause would be visually unreachable.
    expect(
      await pause.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
      }),
    ).toBe(true);
    // And every region is inert behind it — an off-screen but reachable pinned
    // zone would be its own defect.
    await expect(page.locator("[data-region][inert]")).toHaveCount(4);
  }
});
