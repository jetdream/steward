/**
 * The Controls story (XA-6 / UXS-6 / AUTS-3 / ONBS-4), against the seeded demo
 * org. It toggles the kill switch, so it gets its own org and runs serially.
 */
import { expect, type Page, test } from "@playwright/test";
import { demoEmailFor } from "../../backend/src/demo/seed.js";

test.describe.configure({ mode: "serial" });

async function signIn(page: Page, project: string): Promise<void> {
  await page.goto("/");
  const doorstep = page.locator("[data-screen='doorstep']");
  await doorstep.waitFor({ state: "visible", timeout: 30_000 });
  await page.getByRole("button", { name: /sign in instead/i }).click();
  await doorstep.locator("input[name='email']").fill(demoEmailFor(project, "controls"));
  await doorstep.locator("button[type='submit']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
}

/** @validates US-18 (the controls tell her the truth about what I can and cannot do) */
test("US-18: every channel states its own health, and the kill switch is a mirror", async ({
  page,
}, testInfo) => {
  await signIn(page, testInfo.project.name);

  await page.locator("[data-chrome='controls']").click();
  const pane = page.locator("dialog[open]");
  await expect(pane.locator("[data-controls]")).toBeVisible({ timeout: 30_000 });

  // EVERY channel is listed, each with its own plain-language state — a channel
  // missing from this list is one whose health the founder cannot check.
  const channels = pane.locator("[data-channel]");
  await expect(channels).toHaveCount(4);
  const summaries = await pane.locator("[data-channel-summary]").allTextContents();
  expect(summaries).toHaveLength(4);
  for (const s of summaries) {
    expect(s.trim().length).toBeGreaterThan(0);
    // Plain language, never a status code leaking through.
    expect(s).not.toMatch(/\b(expired|revoked|error|null|undefined)\b/);
  }

  // An unconnected channel is an INVITATION — it offers connect and does not nag.
  await expect(pane.locator("[data-connect]").first()).toBeVisible();

  // The settings with no backend are NAMED as absent, not rendered as controls.
  await expect(pane.locator("[data-not-yet]")).toBeVisible();

  // The kill switch here MIRRORS the chrome's Pause — same state, both ways.
  const mirror = pane.locator("[data-kill-switch]");
  await expect(mirror).toBeVisible();
  await mirror
    .getByRole("button", { name: /pause|stop/i })
    .first()
    .click();
  await expect(page.locator("[data-chrome='resume']")).toBeVisible({ timeout: 30_000 });
  await page.locator("[data-chrome='resume']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
  // And the mirror followed the chrome back, rather than holding its own state.
  await expect(mirror.getByRole("button", { name: /pause|stop/i }).first()).toBeVisible();
});
