---
kind: challenge-record
spec: experience/ui.yaml (DEC-9 delta round)
round: 2
date: 2026-07-17
verdict: pass
by: cortex:architect-challenger (Product-Designer lens, delta-scoped)
---

# Product-Designer lens — DEC-9 delta (news site, radar feed, bots)

Delta-scoped per the challenge policy: r1 findings verified as fixed
implicitly by attacking their classes on the delta; fresh attack on
UI-58..66, UI-14 v2, UI-17 v2, UI-6 v3, UI-8 v3 and their interactions.
Convergence rule applied: no blocker; all findings resolved in the change
recording this verdict — (1) published-article unpublish at P0 in UI-42;
(2) long-form article review + editable topic tags in UI-8; (3) DS-5 v3
folds CitationBlock + ArticleLink into the owned inventory, GR-7 v2 widens
the pointer to DS-1..8, DESIGN.md mirrored; (4) voice notes named supported
in UI-64; (5) news page + articles in UI-45's loss summary/export + Q-11
URL afterlife; (6) audience-reader persona added to users.md + register
intent acknowledges the non-founder chapter; (7) donation-URL boundary
extended to the news page by explicit founder nod (scope.md); (8) glossary
gains Article / News page and qualifies Channel; (9) UI-6 chip wording
scoped to NAV chip; (10) NWS-6 carries its conscious no-journey line.

## Verbatim verdict

VERDICT: pass-with-findings (a pass under the convergence rule: no blocker survives; every should-fix is a one-to-three-line register/body edit, landable in the change that records this verdict)
SPEC: /home/coder/project/.spec/experience/ui.yaml (DEC-9 delta: UI-58..66 new; UI-14 v2, UI-17 v2, UI-6 v3, UI-8 v3; + interactions with the DEC-8 spine)
FINDINGS:

1. [should-fix] UI-59 designs the donor side of a founder affordance that exists nowhere — "article unpublished/recalled" presupposes a published-article take-down, but UI-29's approved-undo works only "until it publishes", UI-42's recall covers "approved-but-unpublished" only, and UI-39's delete lives inside the TL1 veto flow. Survives scrutiny because the news page is the one channel where Steward is the org's ONLY control surface: on FB/IG/X the founder can delete natively; on their own hosted page they cannot remove content at all (VAL-3 "always revocable"; the exact sibling of r1 finding 1). Fix: one line in UI-42 (or a UI-8 state): a published article can be unpublished at P0 — the news-page sibling of approved-undo — which is also what makes UI-59's "recalled" state reachable.

2. [should-fix] The founder-side article experience is undesigned: UI-8 v3 mentions the news page only via the article-LINK state, which presupposes the article is already published. Nothing says where a Medium-length article (headline, hero image, long body) is reviewed — UI-8 is a social-card design validated in two mockup rounds — nor where its topic tags (NWS-4, donor-visible on UI-60/61) are seen or corrected before publish. A designer executing UI-8 v3 has no signal one variant tab contains a full article. Fix: 1–2 lines in UI-8 (news variant gets a long-form review treatment; topic tags visible/editable at review) or a UI-29 state.

3. [should-fix] The delta re-commits the exact r1-finding-3 / GR-7 class: UI-60's "citation block" (GR-5's visual form — already shared with UI-29's "external card (citation-first)", so a two-surface treatment) and UI-8 v3's "article-link state" (FitBadge's per-variant sibling) are screen-invented; neither DS-5 v2 nor DS-8 owns them. GR-7: a screen inventing its own component is a governed violation, not taste. Fix: fold both into DS-5 (v3, decided-by DEC-9) or DS-8, mirroring the r1 resolution; while there, note GR-7's inventory pointer "(DS-1..7)" now excludes DS-8's owned components (footer, slots), and DS-5's OptionalReason text ("shared by Skip and veto") gains a third consumer in UI-63.

4. [should-fix] UI-64's only media state contradicts BOT-1: the requirement explicitly ingests "voice-notes-as-text", but the flow's unsupported-media reply — honest "send it as a photo or text" — reads as bouncing voice notes. Ambiguity resolving against the cited requirement's explicit list is what the state enumeration exists to prevent. Fix: one line — name voice notes supported (transcribed → Memory), scope "unsupported" to video/stickers/documents.

5. [should-fix] Org churn x permanent public URLs is undesigned in both directions: BIL-2's exit (UI-45 "here's what you'll lose") never names the news page — the org's public face and every social link pointing at it (NWS-5 made those links the designed pattern) — and nothing says whether articles are in the BIL-2 export. Cohort-1 economics (refund <20% target, G-1) guarantee churned orgs with live, linked articles. Fix: one line in UI-45 (news page in the loss summary; articles in the export) + optionally a Q-* on URL afterlife (tombstone vs 410).

6. [should-fix] The first non-founder persona has no single-source home: users.md defines only Founder-Operator/partners/operators, and the register intent still reads "The founder's experience is a relationship over months — journeys are its chapters" — falsified by UI-58. Downstream design (UI-60/61 briefs) needs the reader persona (arrives mobile, from in-app social browsers, low context, seconds of attention) where "who are the users?" routes. Fix: a short audience-persona paragraph in users.md + one line in the ui.yaml intent acknowledging the public-reader chapter.

7. [should-fix, low] UI-59's back-out path places the donation URL on the public page, but the scope.md boundary case authorizes exactly "ask posts include it". No rule is violated (the module prohibition holds; the body even cites the boundary), but the round's own defense against scope creep is carve-out precision, and this extension is donor-money-adjacent — it should get the founder's one-line nod while DEC-9's round is open. Fix: extend the boundary clause ("ask posts and the news page may carry it") under this round, or drop the mention from UI-59.

8. [should-fix, low] Round-introduced vocabulary never reached the glossary (semantic-clarity rule: same change): "Article"/"news page" are undefined, and glossary "Channel" — "A connected social destination: Facebook Page, Instagram feed, Threads, or X" — is now false by omission, with real bite: GEN-2 generates variants "for every connected channel", and the news page is never "connected", so a literal reading produces no article variant ever. Fix: add Article/News page; qualify Channel (social channel vs publishing destination incl. the news adapter, ARC-18).

9. [note] UI-6 v3's new absolute — "the only permitted chip stays on Inbox" — collides in a strict reading with UI-33's designed INT-3 arrival ("a quiet companion badge"). Refuted as a violation (chip = rail vocabulary; the companion is not a nav destination) but one scoping word ("the only permitted nav chip") removes the trap. Not blocking.

10. [note] The consciously-uncovered additions: DS-8 is cleanly defensible (self-referential like DS-1..7, and actually experienced through UI-60/61 which cite it). NWS-6's consciousness lives only in this round's invocation + the gap list — the APR-2 precedent (r1 finding 7) got a greppable "deliberately a settings affordance" line in UI-12; NWS-6 deserves the same one line when convenient. Not blocking: this record carries the declaration.

What I attacked and why it held:
- Serves-edge truth, statement by statement: NWS-1..5 against UI-58/59/60/61 (hosted read, SEO/unfurl/canonical states, DS-8 template + footer, topic rail with both ladders, link arrival + UI-8 link state) — real, modulo the founder-half gaps in findings 1–2; EXT-5/UX-8 against UI-62/63 — fully delivered including the marks→Memory loop, draft handoff routed through the digest (EXT-2/EXT-3/GEN-5 intact), and pull-only stated three times consistently (UX-8, UI-62, UI-6 v3); BOT-1..3 against UI-64/65/66 — delivered, including account-link handshake, WhatsApp messaging-window fallback riding UI-55, and the BOT-2 "deeper → deep link" boundary; homing BOT under UI-14 (not UI-3) matches the register's ingestion-first intent, cross-link present.
- Machinery, by mutation (restored byte-identically): bogus serves target ⇒ hard error "DCX-3: reference to undefined ID NWS-99" at the pointing line; removing NWS-1 from UI-58 ⇒ NWS-1 (P0) appears in the "no UX journey" gap list. `npm run docs:check` green (269 IDs, 929 refs, 0 errors) before and after.
- Persona leakage: UI-60 explicitly strips app chrome/founder controls; the "published with Steward" seam is stated and G-1-purposed. Held.
- Pull-only vs the counted stack: UI-63 self-defines as anti-UI-7 ("no progress, no counts, no completion state"); the only chip stays on Inbox. Held.
- Guardrail reach: GR-1/GR-2/GR-5 stated on the public surface (UI-58/UI-60); GR-3/STR-3 hold structurally because articles ride the same draft pipeline; GR-6 posture extended to bots via BOT-3 (flexibility: hard) + A-8. Held.
- Cross-spine: PUB-1's four untouched everywhere (NWS intent/NWS-1/UI-26/UI-50); roadmap P1b slice + R-9 cut-first clause + Q-8 decide-before-build all mutually consistent; DEC-9's binds match the shipped delta; "validated in mockup rounds 1-2 (pre-Radar)" honestly marks stale evidence. Held.
- Nesting/altitude: all new elements legally nested (journey→flow→screen/touchpoint), serves only on the journey, no pixel detail above screen level. Held.
