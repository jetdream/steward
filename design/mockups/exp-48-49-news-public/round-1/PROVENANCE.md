# EXP-48/49 — the public news pages: round-1 provenance

- **Owning design-elements:** EXP-48 (news article, public), EXP-49 (news
  front page, public) — journey EXP-9 "The donor reads", flow EXP-36.
  Register: `.spec/experience/spine.yaml`.
- **Source:** Claude Design project **AI-S-SC**
  (`ba692adc-80ca-4994-a10b-4c1f972049d1`), file `screens/news-public.html`;
  authored 2026-07-19 on the **AI-S-DS** design system, at true breakpoints
  (desktop + 390px phone).
- **Persona note:** these are the DONOR's surfaces, not the founder's — the
  DS-8 template wears the ORG's slots (name, logo, accent — a deliberately
  non-Steward deep green here) with the steward type/layout underneath (Q-10:
  no per-org typography). Demonstrates: citation block on external claims
  (GR-5), topic navigation (NWS-4, rail on desktop / chips on phone),
  "published with Steward" growth seam (NWS-3), and the warm org-branded
  not-here page a recalled article's URL serves (EXP-36; never a bare 404).
  Server-rendering, canonical URLs, and OG correctness are acceptance
  criteria on EXP-36 (NWS-2), not visible in this static mockup.
- **Review:** founder approved ("looks good, proceed", 2026-07-19).
- **Audit:** no automated design-verifier pass (no browser tooling in
  session); rendering founder-verified.
- **File:** `News Public (article + front page).html` (= `screens/news-public.html`).
