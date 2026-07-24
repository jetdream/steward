/**
 * Unit tests for ONBS-2 source ingestion: the HTML→text reduction, the
 * deterministic grounded guard (no ref/text → not written), and the write context
 * (every ingested entry carries `onboarding-ingest` provenance + the source ref +
 * `assumed: true`, on the non-correction channel). Fakes the source-fetch port +
 * Memory's write path — no network, no DB, no LLM (LRN-20).
 *
 * @verifies ONBS-2 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { OrgId } from "@shared";
import { htmlToText } from "../adapters/sources/fetch.js";
import type { WriteContext } from "../memory/write.js";
import type { FetchedArtifact, SourceFetchPort } from "../ports/sources.js";
import { ingestible, ingestSources } from "./ingest.js";

test("htmlToText drops script/style, strips tags, decodes entities, collapses whitespace", () => {
  const html =
    "<html><head><style>.x{color:red}</style></head><body><script>evil()</script>" +
    "<h1>Feed &amp; Read</h1>\n\n<p>No family goes&nbsp;hungry.</p></body></html>";
  const text = htmlToText(html);
  assert.equal(text, "Feed & Read No family goes hungry.");
});

test("the grounded guard rejects an artifact with no ref or no text (ONBS-2)", () => {
  assert.equal(ingestible({ ref: "https://x.org", text: "hi", kind: "website" }), true);
  assert.equal(ingestible({ ref: "", text: "hi", kind: "website" }), false);
  assert.equal(ingestible({ ref: "https://x.org", text: "   ", kind: "website" }), false);
});

test("ingested entries carry the source ref + assumed:true on the non-correction channel", async () => {
  const orgId = OrgId.parse("org-ingest-1");
  const artifacts: FetchedArtifact[] = [
    { ref: "https://acme.org/about", text: "Our mission is to feed families.", kind: "website" },
    { ref: "", text: "no pointer — dropped", kind: "website" }, // fails the grounded guard
  ];
  const sources: SourceFetchPort = {
    name: "fake",
    async scrapeSite() {
      return artifacts;
    },
    async harvestMeta() {
      return [];
    },
  };
  const writes: { raw: string; ctx: WriteContext }[] = [];
  const memory = {
    async write(raw: string, ctx: WriteContext) {
      writes.push({ raw, ctx });
      return [];
    },
  };

  const result = await ingestSources({ memory, sources }, orgId, {
    siteUrls: ["https://acme.org/about"],
  });

  assert.equal(result.fetched, 2); // both artifacts fetched
  assert.equal(writes.length, 1); // only the ingestible one is written (grounded guard)
  const first = writes[0];
  assert.ok(first);
  const { raw, ctx } = first;
  assert.equal(raw, "Our mission is to feed families.");
  assert.equal(ctx.source.trigger, "onboarding-ingest");
  assert.equal(ctx.source.ref, "https://acme.org/about");
  assert.equal(ctx.assumed, true);
  assert.equal(ctx.correctionChannel, false);
});
