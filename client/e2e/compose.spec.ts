/**
 * The compose story (XH-14 / APRS-5 / UXS-7), against the seeded demo org.
 *
 * This spec CREATES a draft, so it gets its own org (see `DEMO_SUITES`) and runs
 * serially within the file.
 */
import { expect, type Page, test } from "@playwright/test";
import { demoEmailFor } from "../../backend/src/demo/seed.js";

test.describe.configure({ mode: "serial" });

async function signIn(page: Page, project: string): Promise<void> {
  await page.goto("/");
  const doorstep = page.locator("[data-screen='doorstep']");
  await doorstep.waitFor({ state: "visible", timeout: 30_000 });
  await page.getByRole("button", { name: /sign in instead/i }).click();
  await doorstep.locator("input[name='email']").fill(demoEmailFor(project, "compose"));
  await doorstep.locator("button[type='submit']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
}

/** @validates US-16 (writing something herself goes through the same checks) */
test("US-16: compose opens over the home, parks a half-written sheet, and lands a draft", async ({
  page,
}, testInfo) => {
  await signIn(page, testInfo.project.name);

  // Compose is an ACTION: the home is still underneath, and the URL never moves.
  const urlBefore = page.url();
  await page.locator("[data-chrome='compose']").click();
  const pane = page.locator("dialog[open]");
  await expect(pane).toBeVisible({ timeout: 30_000 });
  expect(page.url()).toBe(urlBefore);
  await expect(page.locator("[data-home-column]")).toBeVisible();

  // Half-write it, then leave.
  const words = `Thank you to Saturday's volunteers ${Date.now()}`;
  await pane.locator("[data-compose-title]").fill("Saturday");
  await pane.locator("[data-compose-body]").fill(words);
  await pane.getByRole("button", { name: /back to steward/i }).click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);

  // XH-14: reopening brings the words back rather than starting blank.
  await page.locator("[data-chrome='compose']").click();
  await expect(pane).toBeVisible({ timeout: 30_000 });
  await expect(pane.locator("[data-compose-body]")).toHaveValue(words);

  // Hand it over. What comes back is a DRAFT to confirm — the pane swaps to the
  // opened draft showing the per-channel versions, and nothing has shipped.
  await pane.locator("[data-compose-submit]").click();
  await expect(pane.locator("[data-master-body]")).toContainText(words, { timeout: 60_000 });
  await expect(pane.getByRole("tab").first()).toBeVisible({ timeout: 30_000 });

  // Back on the home, the composed post is in the stack awaiting confirmation —
  // it did NOT publish itself.
  await pane.getByRole("button", { name: /back to steward/i }).click();
  await expect(page.locator("[data-region='ready']")).toContainText(words, { timeout: 30_000 });
});
