/**
 * The doorstep stories — the first specs in this tier that touch a REAL backend
 * (BetterAuth + Postgres). "Sign up with two fields and land on your home" is
 * not a claim a stub can validate: the whole of ONB-1's promise is that the
 * signup triple gets created and the org exists afterwards.
 *
 * Each `@validates` marker sits on its own test block, not in this header.
 */
import { expect, test } from "@playwright/test";

/**
 * A fresh identity per test. Signup is the thing under test, so these specs
 * MUST NOT reuse an account — a returning-user path would skip org creation
 * entirely and still look green. The project name keeps the desktop and phone
 * runs from racing for the same email.
 */
function newFounder(project: string): { email: string; orgName: string } {
  const tag = `${project}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return { email: `maria+${tag}@example.org`, orgName: `River Keepers ${tag}` };
}

/** Fill the doorstep and submit; resolves once the home's chrome is up. */
async function signUp(
  page: import("@playwright/test").Page,
  who: { email: string; orgName: string },
) {
  await page.goto("/");
  await page.locator("[data-screen='doorstep'] input[name='orgName']").fill(who.orgName);
  await page.locator("[data-screen='doorstep'] input[name='email']").fill(who.email);
  await page.locator("[data-screen='doorstep'] button[type='submit']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
}

/** @validates US-6 (two fields is the whole of signing up) */
test("US-6: two fields and a consent sentence get her into her own home", async ({
  page,
}, testInfo) => {
  const who = newFounder(testInfo.project.name);
  await page.goto("/");

  const doorstep = page.locator("[data-screen='doorstep']");
  await expect(doorstep).toBeVisible();

  // EXACTLY two inputs. The count is the assertion, not a floor: a wizard step,
  // an EIN box, or a consent checkbox appearing here is the regression this
  // story exists to catch (ONB-1 — nothing blocks on completeness).
  await expect(doorstep.locator("input")).toHaveCount(2);
  await expect(doorstep.locator("input[name='orgName']")).toBeVisible();
  await expect(doorstep.locator("input[name='email']")).toBeVisible();

  // Consent is stated in plain language before the button (A-5), and is prose
  // rather than a control — a checkbox here would be a gate ONB-1 forbids.
  const consent = doorstep.locator("[data-consent]");
  await expect(consent).toBeVisible();
  expect((await consent.innerText()).length).toBeGreaterThan(40);
  await expect(doorstep.locator("input[type='checkbox']")).toHaveCount(0);

  await doorstep.locator("input[name='orgName']").fill(who.orgName);
  await doorstep.locator("input[name='email']").fill(who.email);
  await doorstep.locator("button[type='submit']").click();

  // She lands on the home — the chrome is the home, and the greeting carries
  // the name SHE typed, proving the org was created from her field and not
  // derived from her address.
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
  // Anywhere on the home, deliberately: the story's acceptance is that the
  // greeting CARRIES her name, and which region greets her is the home's shape
  // to decide (day one greets from Ready). Pinning a region here would make
  // this story fail every time the shape changes, which is not what it asserts.
  await expect(page.getByRole("heading", { name: new RegExp(who.orgName) })).toBeVisible({
    timeout: 30_000,
  });
  await expect(doorstep).toHaveCount(0);

  // Signing out returns her to the doorstep.
  await page.locator("[data-signout]").click();
  await expect(page.locator("[data-screen='doorstep']")).toBeVisible({ timeout: 30_000 });
});

/** @validates US-7 (Pause is the real switch, not a button that looks like one) */
test("US-7: pausing survives a full reload, and so does resuming", async ({ page }, testInfo) => {
  await signUp(page, newFounder(testInfo.project.name));

  await page.locator("[data-chrome='pause']").click();
  await expect(page.locator("[data-chrome='resume']")).toBeVisible({ timeout: 30_000 });

  // The reload is the whole test. Component state would look identical up to
  // this line and evaporate here — a kill switch that forgets when the tab
  // closes stops nothing (AUT-3 is hard).
  await page.reload();
  await expect(page.locator("[data-chrome='resume']")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("[data-chrome='pause']")).toHaveCount(0);

  await page.locator("[data-chrome='resume']").click();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
  await page.reload();
  await expect(page.locator("[data-chrome='pause']")).toBeVisible({ timeout: 30_000 });
});
