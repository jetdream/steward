/**
 * The conversation-region stories (UXS-2 / CHTS-2/4/5), against a real backend
 * with the dev-stub model port.
 *
 * US-11 is the one that matters most here, and its assertion is deliberately
 * about what is NOT written: the confirm-back gate is only real if cancelling
 * leaves Memory untouched.
 */
import { expect, type Page, test } from "@playwright/test";

/** A brand-new founder — an empty org is what makes "nothing written yet" legible. */
async function arrive(page: Page, project: string): Promise<void> {
  const tag = `${project}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  await page.goto("/");
  await page.locator("input[name='orgName']").fill(`River Keepers ${tag}`);
  await page.locator("input[name='email']").fill(`maria+${tag}@example.org`);
  await page.locator("button[type='submit']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
}

/** @validates US-10 (the conversation never shows her an empty box) */
test("US-10: there is always something to say, and every suggestion says why", async ({
  page,
}, testInfo) => {
  await arrive(page, testInfo.project.name);
  const conversation = page.locator("[data-region='conversation']");

  const openings = conversation.locator("[data-opening]");
  await expect(openings.first()).toBeVisible({ timeout: 30_000 });

  // CHTS-4 is a STRUCTURAL gate: one non-empty reason per opening. Read in ONE
  // pass — the list grows as `chat.openings` and the gap model resolve at
  // different times, so comparing a count captured earlier against a later read
  // races against the product working correctly.
  const pairs = await conversation.locator("[data-openings] > *").evaluateAll((rows) =>
    rows.map((r) => ({
      opening: r.querySelector("[data-opening]")?.textContent?.trim() ?? "",
      reason: r.querySelector("[data-opening-reason]")?.textContent?.trim() ?? "",
    })),
  );
  expect(pairs.length).toBeGreaterThan(0);
  for (const p of pairs) {
    expect(p.opening.length, `opening empty in ${JSON.stringify(p)}`).toBeGreaterThan(0);
    expect(p.reason.length, `no reason for "${p.opening}"`).toBeGreaterThan(0);
  }

  // Tapping a prompt fills the composer — she answers rather than composes.
  // (The interview opening starts questioning instead, so pick a prompt one.)
  const composer = conversation.locator("[data-composer]");
  await expect(composer).toHaveValue("");
  // Wait for the SERVER's suggestions before picking one. Until `chat.openings`
  // resolves the list holds only the local floor, so reading a label then and
  // clicking after would capture one opening and click a different one — the
  // list is correct throughout; the snapshot in between is not.
  await expect(openings).toHaveCount(2, { timeout: 30_000 });
  const prompt = openings.filter({ hasNotText: "Ask me something" }).first();
  const label = (await prompt.textContent())?.trim() ?? "";
  expect(label.length).toBeGreaterThan(0);
  await prompt.click();
  await expect(composer).toHaveValue(label);

  // And SENDING it works from a cold start. This org has never talked, so there
  // is no conversation session yet; the founder's very first message must open
  // one rather than vanishing. It vanished silently until the E8 browser check
  // caught it — an empty composer and no turn is indistinguishable from a
  // network failure the product never mentions.
  await conversation.getByRole("button", { name: "Send", exact: true }).click();
  await expect(conversation.locator("[data-chat-author='founder']")).toContainText(label, {
    timeout: 30_000,
  });
  await expect(conversation.locator("[data-chat-author='steward']").first()).toBeVisible({
    timeout: 30_000,
  });
});

/** @validates US-11 (a standing rule is confirmed back before it binds) */
test("US-11: cancelling a rule writes nothing; confirming it writes once", async ({
  page,
}, testInfo) => {
  await arrive(page, testInfo.project.name);
  const conversation = page.locator("[data-region='conversation']");
  const known = page.locator("[data-region='ready']").getByText("Here's what I know so far");

  // A brand-new org knows nothing, so the review card is absent. That absence is
  // the baseline the gate is measured against.
  await expect(known).toHaveCount(0);

  await conversation.locator("[data-composer]").fill("Never name our donors in a post.");
  await conversation.locator("[data-make-rule]").click();

  // Steward states its interpretation and has written NOTHING.
  const confirm = page.locator("[data-redirect-confirm]");
  await expect(confirm).toBeVisible({ timeout: 30_000 });
  await expect(confirm.locator("[data-interpretation]")).toBeVisible({ timeout: 30_000 });
  await expect(confirm).toContainText(/nothing is saved yet/i);
  await expect(known).toHaveCount(0);

  // Cancelling must leave Memory exactly as it was — the whole point of a gate.
  await confirm.locator("[data-cancel-rule]").click();
  await expect(confirm).toHaveCount(0);
  await expect(known).toHaveCount(0);

  // Only confirming binds it.
  await conversation.locator("[data-make-rule]").click();
  await expect(page.locator("[data-redirect-confirm]")).toBeVisible({ timeout: 30_000 });
  await page.locator("[data-confirm-rule]").click();
  await expect(page.locator("[data-redirect-confirm]")).toHaveCount(0, { timeout: 30_000 });
  await expect(known).toBeVisible({ timeout: 30_000 });
});
