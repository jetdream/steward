/**
 * @verifies ONBS-2 v1  (sources are NAMED or confirmed — never silently bound)
 * @verifies ONBS-6 v1  (the day-one shape follows the deterministic MVC predicate)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { isDayOne, proposedSiteFromEmail, toFindings } from "./dayOne.js";

test("ONBS-2: an org-domain address proposes that org's site", () => {
  assert.equal(proposedSiteFromEmail("maria@hopeandpaws.org"), "https://hopeandpaws.org");
  assert.equal(proposedSiteFromEmail("Maria@HopeAndPaws.ORG"), "https://hopeandpaws.org");
  // A plus-tag and a subdomain are both still the org's own host.
  assert.equal(
    proposedSiteFromEmail("maria+news@mail.hopeandpaws.org"),
    "https://mail.hopeandpaws.org",
  );
});

test("ONBS-2: a public mail host proposes NOTHING — reading gmail.com is nonsense", () => {
  for (const host of ["gmail.com", "outlook.com", "icloud.com", "proton.me", "yahoo.com"]) {
    assert.equal(proposedSiteFromEmail(`maria@${host}`), null, host);
  }
});

test("ONBS-2: a malformed or absent address proposes nothing rather than guessing", () => {
  assert.equal(proposedSiteFromEmail(undefined), null);
  assert.equal(proposedSiteFromEmail(""), null);
  assert.equal(proposedSiteFromEmail("maria"), null);
  assert.equal(proposedSiteFromEmail("@hopeandpaws.org"), null); // no local part
  assert.equal(proposedSiteFromEmail("maria@localhost"), null); // no dot
  assert.equal(proposedSiteFromEmail("maria@host /path"), null);
});

test("ONBS-6: day-one shape holds until the MVC predicate says ready", () => {
  assert.equal(isDayOne(undefined), true, "unanswered predicate stays day-one");
  assert.equal(isDayOne({ ready: false }), true);
  assert.equal(isDayOne({ ready: true }), false);
});

const entry = (over: Partial<Parameters<typeof toFindings>[0][number]> = {}) => ({
  id: "e1",
  kind: "fact",
  subject: null,
  content: "We run adoption days.",
  assumed: true,
  ...over,
});

test("findings read newest-first and keep the assumed mark", () => {
  const out = toFindings(
    [entry({ id: "a", content: "First." }), entry({ id: "b", content: "Second.", assumed: false })],
    10,
  );
  assert.deepEqual(
    out.map((f) => f.id),
    ["b", "a"],
  );
  assert.deepEqual(
    out.map((f) => f.assumed),
    [false, true],
  );
});

test("findings show the subject only when it adds something", () => {
  const [withSubject] = toFindings(
    [entry({ subject: "Adoption days", content: "Every second Saturday at Zilker Park." })],
    1,
  );
  assert.equal(withSubject?.text, "Adoption days — Every second Saturday at Zilker Park.");

  // The content already opens with the subject — prepending it would stutter.
  const [redundant] = toFindings(
    [entry({ subject: "Adoption days", content: "Adoption days are every second Saturday." })],
    1,
  );
  assert.equal(redundant?.text, "Adoption days are every second Saturday.");
});

test("the limit keeps the MOST RECENT findings, not the first ones", () => {
  const many = Array.from({ length: 5 }, (_, i) => entry({ id: `e${i}`, content: `n${i}` }));
  assert.deepEqual(
    toFindings(many, 2).map((f) => f.id),
    ["e4", "e3"],
  );
});
