/**
 * The day-one stories. Both run against a REAL backend on the dev Postgres with
 * the dev-stub model port, so the interview questions are deterministic and no
 * network read happens.
 *
 * Ingestion is deliberately NOT driven here: `onboarding.ingest` fetches a live
 * website, which would make this tier depend on the internet. Its behaviour is
 * covered at the integration tier (`ingest.integration.test.ts`); what these
 * stories own is the RENDERED state — that day one looks like the same home, and
 * that the conversation outlives a reload.
 */
import { expect, type Page, test } from "@playwright/test";

/** Sign up a brand-new founder — every day-one story needs an empty org. */
async function arriveOnDayOne(page: Page, project: string): Promise<void> {
  const tag = `${project}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  await page.goto("/");
  await page.locator("input[name='orgName']").fill(`River Keepers ${tag}`);
  await page.locator("input[name='email']").fill(`maria+${tag}@example.org`);
  await page.locator("button[type='submit']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
}

/** @validates US-8 (day one is the same home, filling in — never a wizard) */
test("US-8: day one is the same home, with no wizard anywhere in it", async ({
  page,
}, testInfo) => {
  await arriveOnDayOne(page, testInfo.project.name);

  // The same chrome and the same region ORDER as any other day. If day one had
  // become its own screen, one of these would be missing or out of order.
  await expect(page.locator("[data-chrome='pause']")).toBeVisible();
  await expect(page.locator("[data-chrome='controls']")).toBeVisible();
  await expect(page.locator("[data-chrome='compose']")).toBeVisible();
  await expect(page.locator("[data-look-inside]")).toHaveCount(4);
  const regions = await page
    .locator("[data-region]")
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.region));
  expect(regions).toEqual(["ready", "conversation", "terminus"]);
  // Pinned is absent because it is EMPTY, not because day one drops it — an
  // empty region renders nothing rather than a labelled empty box.
  await expect(page.locator("[data-region='pinned']")).toHaveCount(0);

  // No wizard furniture. These are the shapes a setup flow takes, and R-10 says
  // any of them churns this persona.
  await expect(page.locator("progress, [role='progressbar']")).toHaveCount(0);
  await expect(page.getByText(/step \d+\s*(of|\/)\s*\d+/i)).toHaveCount(0);
  await expect(page.locator("input[type='checkbox']")).toHaveCount(0);

  // The source question is a question, and it can be declined.
  await expect(page.locator("[data-start-reading]")).toBeVisible();
  const decline = page.getByRole("button", { name: /that's not us/i });
  if (await decline.isVisible()) {
    await decline.click();
    // Declining reveals the naming field — it never dead-ends.
    await expect(page.locator("[data-site-url]")).toBeVisible();
  }

  // And talking works regardless of what she did about the site.
  await expect(page.getByRole("button", { name: /ask me something/i })).toBeVisible();
});

/** @validates US-9 (the conversation is in the stream, and still there later) */
test("US-9: the interview lands in the conversation region and survives a reload", async ({
  page,
}, testInfo) => {
  await arriveOnDayOne(page, testInfo.project.name);

  const conversation = page.locator("[data-region='conversation']");
  await page.getByRole("button", { name: /ask me something/i }).click();

  // Steward's questions arrive as messages IN the conversation region — not on
  // a page of their own, and not in Ready.
  const stewardTurns = conversation.locator("[data-chat-author='steward']");
  await expect(stewardTurns.first()).toBeVisible({ timeout: 30_000 });
  const askedCount = await stewardTurns.count();
  expect(askedCount).toBeGreaterThan(0);

  const answer = "They sat on the floor and she climbed into the dad's lap.";
  await conversation.locator("[data-interview-answer]").fill(answer);
  await conversation.getByRole("button", { name: "Send", exact: true }).click();
  await expect(conversation.locator("[data-chat-author='founder']")).toContainText(answer, {
    timeout: 30_000,
  });

  // The reload is the assertion. A transcript held in component state would look
  // identical up to here and vanish — which is Steward forgetting a conversation
  // the founder just had (INTS-2 promises resumable forever).
  await page.reload();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
  await expect(conversation.locator("[data-chat-author='founder']")).toContainText(answer, {
    timeout: 30_000,
  });
  await expect(conversation.locator("[data-chat-author='steward']")).toHaveCount(askedCount);
});
