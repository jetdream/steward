# backend/src/demo/ — the deterministic demo seed

**Purpose.** One synthetic organization with every Ready-spine state visible at
once, so the approval surface can be evaluated by a human (`MANUAL-EVAL.md`) and
asserted by the story tier without waiting on a model to produce the right mix.

| File | Role |
|---|---|
| `seed.ts` | `seedDemoOrg` — wipes and rewrites the demo org's content; `DEMO_EMAIL`, `demoEmailFor` |
| `run.ts` | `npm run demo:seed` — provisions the org through the real signup path, then seeds it |

```bash
npm run demo:seed                      # the walkthrough org: demo@steward.test
npm run demo:seed -- a@x.test b@x.test # one org per address (the e2e tier does this)
```

**Why it exists rather than generating drafts.** The keyless model port's
guardrail judge is deliberately dormant and fail-safe, so it escalates EVERY
draft — a correct posture that makes "a clean, approvable card" unreachable by
generation. The states that matter have to be pinned deterministically.

## Rules that bite

- **Synthetic only (SEC-4).** Every fact is invented for a fictional shelter. No
  real org's content is ever seeded, quoted, or copied.
- **The org is created through BetterAuth**, not by inserting rows — a demo org
  that skipped the (User, Org, owner-Membership) triple would not be reachable by
  dev sign-in, which is the entire point of seeding it.
- **Idempotent by deletion.** Re-seeding wipes first: a seed that appended would
  show eleven near-identical drafts by the third run and bury the state coverage
  it exists to demonstrate.
- **One org per e2e project.** The Ready stories dispose of cards and Playwright
  runs desktop and phone concurrently; a shared org would have each project
  clearing the other's stack, both green, neither asserting anything.
- The placeholder photo is an inline data URI so the seed works with no blob
  store running — a broken image in the card that demonstrates the picture
  invariant would read as a bug in the invariant.
