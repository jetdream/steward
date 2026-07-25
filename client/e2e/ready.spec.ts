/**
 * The Ready-spine stories (UXS-3 / APRS-1) — the surface where most founder time
 * lives, so these are the assertions worth being strict about.
 *
 * They run against the SEEDED demo org (see `e2e/global-setup.ts`), because the
 * states that matter — a clean approvable card, a GR-3 hold, an awaiting-picture
 * card — cannot be produced through the UI on a keyless tier.
 *
 * The seed is rewritten once per run, and these specs DISPOSE of cards, so they
 * are serial: two of them clearing the same stack in parallel would each see the
 * other's work and neither would be asserting what it claims.
 */
import { expect, type Page, test } from "@playwright/test";
import { demoEmailFor } from "../../backend/src/demo/seed.js";

test.describe.configure({ mode: "serial" });

/**
 * Sign in as this PROJECT's seeded demo founder (returning mode — email only).
 *
 * Waiting for the doorstep before probing it is load-bearing: the app opens on a
 * loading narration while `auth.me` resolves, so an immediate `isVisible()` reads
 * false, skips the sign-in, and then waits for a home nobody signed into.
 */
async function signInAsDemo(page: Page, project: string): Promise<void> {
  await page.goto("/");
  const doorstep = page.locator("[data-screen='doorstep']");
  await doorstep.waitFor({ state: "visible", timeout: 30_000 });
  await page.getByRole("button", { name: /sign in instead/i }).click();
  await doorstep.locator("input[name='email']").fill(demoEmailFor(project, "ready"));
  await doorstep.locator("button[type='submit']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
}

/** @validates US-12 (the stack is finite, and she can see the end of it) */
test("US-12: the spine states what is left, and every card has ONE accent verb", async ({
  page,
}, testInfo) => {
  await signInAsDemo(page, testInfo.project.name);

  const header = page.locator("[data-spine-header]");
  await expect(header).toBeVisible({ timeout: 30_000 });
  // Finite means COUNTED: "n of m" plus an honest time estimate.
  await expect(header).toHaveText(/Ready for you · \d+ of \d+ · about \d+ minutes?/);

  // DS-2: exactly one accent focal per card. More than one and the founder is
  // choosing between two things that look equally intended.
  const cards = page.locator("[data-ready-card]");
  await expect(cards.first()).toBeVisible({ timeout: 30_000 });
  const accentsPerCard = await cards.evaluateAll((els) =>
    els.map((e) => e.querySelectorAll("[data-accent-focal]").length),
  );
  expect(accentsPerCard.length).toBeGreaterThan(0);
  for (const n of accentsPerCard) expect(n).toBe(1);
});

/** @validates US-13 (a held card cannot be swept away with the rest) */
test("US-13: batch approve says what it will leave, and leaves it", async ({ page }, testInfo) => {
  await signInAsDemo(page, testInfo.project.name);

  // The hold is PINNED, not in the clearable spine. Asserted on the card's
  // IDENTITY rather than its wording — the copy is the founder's to change, and
  // a story that breaks when a sentence is reworded is testing the wrong thing.
  const held = page.locator("[data-region='pinned'] [data-pinned-card]");
  await expect(held).toHaveCount(1, { timeout: 30_000 });
  const heldId = await held.getAttribute("data-pinned-card");
  await expect(page.locator(`[data-region='ready'] [data-ready-card='${heldId}']`)).toHaveCount(0);

  // The exclusion is stated BEFORE the tap — a guarantee, not a surprise.
  const batch = page.locator("[data-batch-approve]");
  await expect(batch).toBeVisible();
  await expect(batch).toHaveText(/stay with you/);
  await expect(page.locator("[data-batch-exclusions]")).toBeVisible();

  await batch.click();

  // And it kept its word: after the sweep the SAME held card is still pinned.
  await expect(page.locator(`[data-pinned-card='${heldId}']`)).toBeVisible({ timeout: 30_000 });
});

/** @validates US-14 (skipping asks why afterwards, and never makes her answer) */
test("US-14: the card goes first, the question comes after, and can be waved off", async ({
  page,
}, testInfo) => {
  await signInAsDemo(page, testInfo.project.name);

  const cards = page.locator("[data-ready-card]");
  await expect(cards.first()).toBeVisible({ timeout: 30_000 });
  const before = await cards.count();
  // Skip the LAST card in the spine on purpose. Gating the region on "are there
  // cards left" destroyed the prompt at exactly this moment — the most common
  // way a founder finishes a visit — and every other card hid the bug.
  const target = cards.nth(before - 1);
  const id = await target.getAttribute("data-ready-card");

  await target.getByRole("button", { name: /^skip$/i }).click();

  // Gone from the spine FIRST — the count drops before anything is asked.
  await expect(page.locator(`[data-ready-card='${id}']`)).toHaveCount(0, { timeout: 30_000 });
  await expect(cards).toHaveCount(before - 1);

  // Only then the optional question, and dismissing it costs nothing.
  const why = page.locator(`[data-skip-reason='${id}']`);
  await expect(why).toBeVisible();
  await expect(why).toContainText(/optional/i);
  await why.getByRole("button", { name: /dismiss|no thanks|×|✕/i }).click();
  await expect(why).toHaveCount(0);
  await expect(page.locator(`[data-ready-card='${id}']`)).toHaveCount(0);
});
