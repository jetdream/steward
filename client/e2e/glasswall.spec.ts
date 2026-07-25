/**
 * The glass-wall story (UXS-4/5/8), against the seeded demo org.
 *
 * Read-only — it opens all four views and inspects them, disposing of nothing,
 * so it shares the `draft` suite's org rather than needing one of its own.
 */
import { expect, test } from "@playwright/test";
import { demoEmailFor } from "../../backend/src/demo/seed.js";

/** The four views, in the fixed chrome order, with the heading each must show. */
const VIEWS = [
  { id: "knowledge", title: "Knowledge" },
  { id: "how-i-write", title: "How I write" },
  { id: "plan", title: "Plan & Published" },
  { id: "discoveries", title: "Discoveries" },
] as const;

/** @validates US-17 (she can look inside at any time, and nothing asks her to) */
test("US-17: all four views open in one click, and none of them badges", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const doorstep = page.locator("[data-screen='doorstep']");
  await doorstep.waitFor({ state: "visible", timeout: 30_000 });
  await page.getByRole("button", { name: /sign in instead/i }).click();
  await doorstep.locator("input[name='email']").fill(demoEmailFor(testInfo.project.name, "draft"));
  await doorstep.locator("button[type='submit']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });

  for (const view of VIEWS) {
    // ONE click — not a menu, not a route, not "ask me in chat".
    await page.locator(`[data-look-inside='${view.id}']`).click();
    const pane = page.locator("dialog[open]");
    await expect(pane).toBeVisible({ timeout: 30_000 });
    // The heading is the SAME plain label the chrome uses; a view whose title
    // differs from its link is a view the founder cannot be sure they opened.
    await expect(pane.getByRole("heading", { name: view.title })).toBeVisible();
    await expect(pane.locator(`[data-view='${view.id}']`)).toBeVisible();
    await pane.getByRole("button", { name: /back to steward/i }).click();
    await expect(page.locator("dialog[open]")).toHaveCount(0);
  }

  // Knowledge carries the seeded facts AND hosts the open-questions list (UXS-5).
  await page.locator("[data-look-inside='knowledge']").click();
  const knowledge = page.locator("dialog[open]");
  await expect(knowledge.locator("[data-knowledge-entries] li").first()).toBeVisible({
    timeout: 30_000,
  });
  await expect(knowledge.locator("[data-open-questions]")).toBeVisible();

  // PULL-ONLY: no badge, count or unread marker — on the links or in the view.
  // Asserted as an absence, because that is exactly what the contract is.
  const linkTexts = await page.locator("[data-look-inside]").allTextContents();
  for (const t of linkTexts) expect(t).not.toMatch(/\d/);
  const badgeish = await page
    .locator("[data-look-inside]")
    .evaluateAll((els) => els.filter((e) => e.children.length > 0).length);
  expect(badgeish).toBe(0);
});
