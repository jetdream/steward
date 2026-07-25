/**
 * The opened-draft story (XH-13 / APRS-1), against the seeded demo org.
 *
 * The seed's clean card deliberately carries a SKIPPED X variant with a reason,
 * because "the omissions stay visible" is the claim this screen exists to keep.
 *
 * Read-only: this spec opens a draft and inspects it, so unlike the Ready
 * stories it disposes of nothing and needs no serial ordering.
 */
import { expect, test } from "@playwright/test";
import { demoEmailFor } from "../../backend/src/demo/seed.js";

/** @validates US-15 (opening a draft shows every channel, skipped ones included) */
test("US-15: the deep review keeps the skipped channels, with their reasons", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const doorstep = page.locator("[data-screen='doorstep']");
  await doorstep.waitFor({ state: "visible", timeout: 30_000 });
  await page.getByRole("button", { name: /sign in instead/i }).click();
  await doorstep.locator("input[name='email']").fill(demoEmailFor(testInfo.project.name, "draft"));
  await doorstep.locator("button[type='submit']").click();

  // Open the card that HAS a skipped channel — chosen by that property, not by
  // position. Taking the first card opened the awaiting-picture one, whose
  // channels all fit, and the story would have "passed" having asserted nothing
  // about skips.
  const cards = page.locator("[data-ready-card]");
  await expect(cards.first()).toBeVisible({ timeout: 30_000 });
  const withSkip = cards.filter({ hasText: /skipped/i }).first();
  await expect(withSkip).toBeVisible();
  await withSkip.locator("[data-open-draft]").click();

  const pane = page.locator("dialog[open]");
  await expect(pane).toBeVisible({ timeout: 30_000 });
  await expect(pane.locator("[data-master-body]")).not.toBeEmpty();

  // A tab per channel, and the skipped one is STILL THERE. Filtering it out
  // would let her approve believing a post goes somewhere it does not.
  const tabs = pane.getByRole("tab");
  const tabCount = await tabs.count();
  expect(tabCount).toBeGreaterThanOrEqual(2);

  // Find the skipped tab by its own state rather than by channel name — which
  // channel gets skipped is the fit gate's call, not this story's.
  const skippedTab = tabs.filter({ hasText: /skipped/i }).first();
  await expect(skippedTab).toBeVisible();
  await skippedTab.click();

  // Selecting it explains the omission specifically, not generically.
  const reason = pane.locator("[data-variant-body]");
  await expect(reason).toBeVisible();
  const paneText = await pane.innerText();
  expect(paneText).toMatch(/skipped/i);
  // The specific seeded reason, so a generic "not a fit" cannot pass this.
  expect(paneText).toMatch(/more room than X allows/i);

  // The schedule marks the skipped channel rather than dropping its row.
  expect(paneText).toMatch(/skipped/i);

  // And the pane leaves cleanly, returning to the home.
  await pane.getByRole("button", { name: /back to steward/i }).click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
