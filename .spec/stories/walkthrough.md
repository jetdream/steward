<!-- Inlined verbatim into MANUAL-EVAL.md by scripts/render-manual-eval.mjs.
     Prose, deliberately: this is guidance to READ, not items to reference,
     so it earns no IDs (VAL-6). The numbered steps come from the stories. -->

## Before you start

Two paths. Do the first; the second is what tells you whether the product is
actually any good.

**A · The seeded org — state coverage.** Every card state at once, deterministic,
no model involved.

```bash
npm run infra:up      # Postgres, if it isn't already up
npm run db:migrate
npm run demo:seed     # writes the synthetic org (SEC-4 — no real org's content)
npm run dev           # api + web on :3000
```

Then open `localhost:3000`, choose **Sign in instead**, and enter
`demo@steward.test`. You will land on a home with a held card pinned, a spine of
two, a published post in the log, an expired Instagram connection, and two
discoveries waiting.

**B · A live run — the real thing.** A fresh org against real Gemini. This is
the path that answers the question the phase exists to ask.

```bash
# .env needs VERTEX_AI_KEY (gitignored; never commit or print it)
npm run dev
```

Sign up at the doorstep with a real nonprofit's name and your address, let it
propose reading that site, answer a couple of its questions, and see what it
writes. Judge the *writing*, not the plumbing.

## What "wrong" means here

A step whose observation holds but which **feels** wrong is still a finding —
the automated checks prove the contract holds, never that the product is good.
The things worth watching for are the ones no assertion can see: does it sound
like a colleague or like software; is the draft something you would actually
post; does the reason under a card explain anything; did anything ask for your
attention that had not earned it.

## Known limitations — none of these are defects

- **Publishing is dev-stubbed.** Nothing reaches Facebook, Instagram, Threads or
  X. The publish log's "live link" goes nowhere; the connectors are the dev
  stand-ins, since the platform OAuth apps are out of scope (`ONBS-4` deferral).
- **501(c)(3) verification does not exist**, so the doorstep asks for no EIN
  rather than showing a verification state it cannot reach.
- **Guided Adjust** (the conversational redraft) has no backend; the verb says
  so. Raw Edit and Redirect are live.
- **No undo after approve.** `APRS-1`'s recall (approved → draft while still
  pending) has no procedure yet, so approving is final until publish.
- **Cadence, notifications and billing** are named as absent in Controls — none
  has a backend.
- **Only TL0 is active.** The trust ladder is shown; TL1/TL2 activation is P2.
- **Keyless runs escalate everything.** With no model key, the guardrail judge is
  dormant and FAIL-SAFE, so every generated draft is held. That is correct
  behaviour, and it is why the seeded org writes its clean card directly.
- **`@news`, billing and the admin/ops console are not built.** Out of this
  phase by scope.
