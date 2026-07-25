/**
 * `npm run demo:seed` — provision the demo org and fill it with the synthetic
 * walkthrough data (SEC-4).
 *
 * The org is created through the REAL BetterAuth signup path rather than by
 * inserting rows: a demo org that skipped the (User, Org, owner-Membership)
 * triple would not be reachable by dev sign-in, which is the whole point of
 * seeding it. Re-running is safe — an existing demo user is reused and only its
 * content is rewritten.
 */
import { OrgId } from "@shared";
import { createAuth, devOtpStore } from "../auth/auth.js";
import { createDb } from "../db/client.js";
import { orgSlug } from "../routers/org.js";
import { DEMO_EMAIL, DEMO_ORG_NAME, seedDemoOrg } from "./seed.js";

try {
  process.loadEnvFile?.();
} catch {
  // .env is optional — CI supplies DATABASE_URL in the environment.
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set (copy .env.example to .env)");

const db = createDb(databaseUrl);
const auth = createAuth(db);

/** Sign a demo user in (creating them on first run) and return authed headers. */
async function signInDemo(email: string): Promise<Headers> {
  await auth.api.sendVerificationOTP({ body: { email, type: "sign-in" } });
  const otp = devOtpStore.get(email);
  if (!otp) throw new Error("dev OTP was not captured — is NODE_ENV production?");
  const res = await auth.api.signInEmailOTP({ body: { email, otp }, asResponse: true });
  const cookies = res.headers.getSetCookie();
  return new Headers({ cookie: cookies.map((c) => c.split(";")[0]).join("; ") });
}

/** Provision one demo org for an address and fill it with the walkthrough data. */
async function seedFor(email: string): Promise<void> {
  const headers = await signInDemo(email);
  const existing = await auth.api.listOrganizations({ headers });
  const org =
    existing[0] ??
    (await auth.api.createOrganization({
      body: { name: DEMO_ORG_NAME, slug: orgSlug(DEMO_ORG_NAME) },
      headers,
    }));
  if (!org) throw new Error(`demo org creation failed for ${email}`);
  await auth.api.setActiveOrganization({ body: { organizationId: org.id }, headers });

  const report = await seedDemoOrg(db, OrgId.parse(org.id));
  console.log(
    [
      `demo:seed — ${org.name} <${email}> (${report.orgId})`,
      `  ${report.memoryEntries} memory entries · ${report.cards} cards · ${report.variants} variants`,
      `  ${report.published} published (with a live link) · ${report.discoveries} discoveries · channels: ${report.channels}`,
      "  states: 1 clean approvable · 1 held (GR-3) · 1 awaiting-picture · 1 variant skipped with a reason",
    ].join("\n"),
  );
}

// Addresses come from argv so the e2e tier can seed one org PER PROJECT (see
// `demoEmailFor`); with none given this seeds the walkthrough's own org.
const emails = process.argv.slice(2).filter((a) => a.includes("@"));
for (const email of emails.length > 0 ? emails : [DEMO_EMAIL]) await seedFor(email);

if (emails.length === 0) {
  console.log(`  sign in at the doorstep with: ${DEMO_EMAIL}  (choose "Sign in instead")`);
}

process.exit(0);
