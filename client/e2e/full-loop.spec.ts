/**
 * The full loop (US-19) — the walk MANUAL-EVAL.md asks a human to do, as one
 * automated pass over the seeded org.
 *
 * This is the spec that would notice the increments having drifted apart: each
 * of the others checks one surface, and this one checks that they still add up
 * to a founder getting something done. It approves, so it owns its org and runs
 * serially.
 */
import { expect, type Page, test } from "@playwright/test";
import { demoEmailFor } from "../../backend/src/demo/seed.js";

test.describe.configure({ mode: "serial" });

async function signIn(page: Page, project: string): Promise<void> {
  await page.goto("/");
  const doorstep = page.locator("[data-screen='doorstep']");
  await doorstep.waitFor({ state: "visible", timeout: 30_000 });
  await page.getByRole("button", { name: /sign in instead/i }).click();
  await doorstep.locator("input[name='email']").fill(demoEmailFor(project, "fullloop"));
  await doorstep.locator("button[type='submit']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
}

/** @validates US-19 (the whole loop closes — approve, and it's in the record) */
test("US-19: open a draft, approve it, and find it in the record", async ({ page }, testInfo) => {
  await signIn(page, testInfo.project.name);

  // 1. The stack says what is waiting.
  const header = page.locator("[data-spine-header]");
  await expect(header).toBeVisible({ timeout: 30_000 });
  const before = await page.locator("[data-ready-card]").count();
  expect(before).toBeGreaterThan(0);

  // 2. Open the one card that can actually be approved — the others are
  //    blocked on purpose (awaiting-picture), and approving is what this
  //    story is about.
  const approvable = page
    .locator("[data-ready-card]")
    .filter({ hasNot: page.locator("text=Needs a photo") })
    .first();
  await expect(approvable).toBeVisible();
  await approvable.locator("[data-open-draft]").click();

  // 3. She reads it properly, then approves from the pane. The TITLE is taken
  //    from the pane, not the card: the spine shows a card's body and the plan
  //    lists titles, so the two views have no string in common to match on.
  const pane = page.locator("dialog[open]");
  await expect(pane.locator("[data-master-body]")).toBeVisible({ timeout: 30_000 });
  const title = (await pane.locator("[data-draft-title]").innerText()).trim();
  expect(title.length).toBeGreaterThan(0);
  await pane
    .getByRole("button", { name: /^approve$/i })
    .first()
    .click();

  // 4. It leaves the stack, and the count drops.
  await expect(page.locator("dialog[open]")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("[data-ready-card]")).toHaveCount(before - 1, { timeout: 30_000 });

  // 5. And it is in the record — no off-stage trust required.
  await page.locator("[data-look-inside='plan']").click();
  const plan = page.locator("dialog[open]");
  await expect(plan.locator("[data-view='plan']")).toBeVisible({ timeout: 30_000 });
  const planned = plan.locator("[data-plan-items]");
  await expect(planned).toContainText(title, { timeout: 30_000 });
  // …and it is recorded as APPROVED, not merely present.
  await expect(planned.locator("li", { hasText: title })).toContainText(/approved/i);
});
