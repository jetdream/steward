/**
 * Memory router — the org-scoped API surface over @backend/memory (ARC-11). All
 * procedures use `orgProcedure`, so every read/write is confined to the session's
 * active org (ACC-3) — the org is NEVER a client-supplied id. Client-facing
 * shapes drop the server-only embedding vector (MemoryEntryView).
 *
 * @implements MEMS-1 v2  (remember → the single write path)
 * @implements MEMS-4 v1  (context → grounded retrieval + overlay)
 * @implements MEMS-5 v1  (shouldAsk → interrupt-or-assume)
 */
import { type MemoryEntryView, OrgId } from "@shared";
import { z } from "zod";
import { orgProcedure, router } from "../trpc.js";

/** Strip the server-only embedding before crossing the API boundary. */
function toView<T extends { embedding: unknown }>(row: T): Omit<T, "embedding"> {
  const { embedding: _embedding, ...view } = row;
  return view;
}

const rememberInput = z.object({ text: z.string().min(1) });
const contextInput = z.object({ slot: z.string().optional() });
const shouldAskInput = z.object({
  subjectKey: z.string().min(1),
  interruptClass: z.enum(["field-material", "founder-owned", "blocking"]).optional(),
});

export const memoryRouter = router({
  /** MEMS-1: write a free remark to Memory (the generic CHT-2-style write path). */
  remember: orgProcedure.input(rememberInput).mutation(async ({ ctx, input }) => {
    const orgId = OrgId.parse(ctx.orgId);
    const written = await ctx.memory.write(input.text, {
      orgId,
      source: { trigger: "chat", detail: input.text },
      correctionChannel: false,
    });
    return { entries: written.map(toView) satisfies MemoryEntryView[] };
  }),

  /** MEMS-4: grounded context for a slot — grounding + full overlay + thinness. */
  context: orgProcedure.input(contextInput).query(async ({ ctx, input }) => {
    const orgId = OrgId.parse(ctx.orgId);
    const { grounding, overlay, thin } = await ctx.memory.retrieveContext(orgId, input.slot);
    return {
      grounding: grounding.map(toView) satisfies MemoryEntryView[],
      overlay: {
        styleRules: overlay.styleRules.map(toView) satisfies MemoryEntryView[],
        taboos: overlay.taboos.map(toView) satisfies MemoryEntryView[],
      },
      thin,
    };
  }),

  /** MEMS-5/MEMS-6: interrupt-or-assume decision, consulting the asked-set. */
  shouldAsk: orgProcedure.input(shouldAskInput).query(async ({ ctx, input }) => {
    const orgId = OrgId.parse(ctx.orgId);
    return ctx.memory.shouldAsk(orgId, {
      subjectKey: input.subjectKey,
      ...(input.interruptClass ? { interruptClass: input.interruptClass } : {}),
    });
  }),
});
