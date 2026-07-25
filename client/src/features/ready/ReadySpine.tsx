/**
 * @implements UXS-3 v1  (Ready is the home's finite spine; holds pin)
 * @implements APRS-1 v3 (the disposition spine — approve / batch / skip / redirect)
 *
 * **Regions 1, 2 and 4 of XH-12** — the surface where most founder time lives
 * (XH-1 / XH-5, the weekly visit).
 *
 *   PINNED   held cards (GR-3/GR-8). Cannot scroll away, never batch-cleared.
 *   READY    the finite, ordered, clearable spine with its count header.
 *   TERMINUS the honest "caught up" — the stream always reaches an end.
 *
 * **One accent verb per card** (DS-2): Approve. Everything else — Edit, Skip,
 * Redirect — is quiet. A second accent would make the founder choose between two
 * things that look equally intended, on the surface they use most.
 *
 * **The batch button states its exclusions before it is pressed.** APRS-1 makes
 * "approve all ready" deterministically skip held and awaiting-picture cards;
 * a button that said only "Approve all" and then quietly left two cards behind
 * would read as a failure rather than the guarantee it is.
 */
import { useState } from "react";
import { useApproval } from "../../api/useApproval.js";
import {
  Button,
  Card,
  CaughtUp,
  HeldForApprovalCard,
  OptionalReason,
  type OptionalReasonChoice,
  PostCard,
  ReasonLine,
  typeRole,
  type VariantSummary,
} from "../../ds/index.js";
import { batchPlan, partitionSpine, spineHeader } from "./spine.js";

/** A Ready card as the API returns it (the DM-5 item plus its variants). */
interface ApiCard {
  item: {
    id: string;
    title: string;
    body: string;
    contentType: string;
    reasonLine: string;
    editorialState: string;
    escalated: boolean;
    valSummary: string;
    mediaAssetId: string | null;
  };
  variants: ReadonlyArray<{
    id: string;
    platform: string;
    fitVerdict: string;
    fitReason: string;
  }>;
}

/** What the Ready feature renders into each region. */
export interface ReadyRegions {
  pinned: React.ReactNode;
  ready: React.ReactNode;
  terminus: React.ReactNode;
}

/**
 * The Ready regions. A hook, not a component, for the same reason day one is:
 * `Home` owns the region landmarks and their per-region `inert` (DSS-24), so
 * anything wrapping them would break that contract.
 */
export function useReady(): ReadyRegions {
  const { stack, approve, batchApprove, skip, explainSkip } = useApproval();
  /** Items skipped in this visit, awaiting their optional reason (CHTS-5). */
  const [justSkipped, setJustSkipped] = useState<string[]>([]);

  const cards = (stack.data ?? []) as ApiCard[];
  const spineCards = cards.map((c) => ({
    id: c.item.id,
    editorialState: c.item.editorialState as "draft" | "awaiting_picture" | "approved" | "skipped",
    escalated: c.item.escalated,
    hasPicture: c.item.mediaAssetId !== null,
  }));
  const { pinned, spine } = partitionSpine(spineCards);
  const byId = new Map(cards.map((c) => [c.item.id, c]));
  const plan = batchPlan(spineCards);

  const dispose = (id: string) => {
    skip.mutate({ itemId: id }, { onSuccess: () => setJustSkipped((prev) => [...prev, id]) });
  };

  return {
    pinned:
      pinned.length > 0 ? (
        <>
          {pinned.map((p) => {
            const card = byId.get(p.id);
            if (!card) return null;
            return (
              <div key={p.id} data-pinned-card={p.id}>
                <HeldForApprovalCard
                  reason={card.item.valSummary || card.item.reasonLine}
                  onApprove={() => approve.mutate({ itemId: p.id })}
                  {...(p.hasPicture ? {} : { approveBlockedReason: "It still needs a picture." })}
                >
                  {card.item.body}
                </HeldForApprovalCard>
              </div>
            );
          })}
        </>
      ) : undefined,

    // Rendered while there are cards OR a skip still owes its optional question.
    // Gating on `spine.length` alone destroyed the "mind saying why?" prompt the
    // instant the founder skipped their LAST card — which is the most common
    // moment to clear a stack, so the enrichment loop (CHTS-5) would have gone
    // silent exactly when it mattered most.
    ready:
      spine.length > 0 || justSkipped.length > 0 ? (
        <>
          {spine.length > 0 ? (
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={`${typeRole.subsection} text-fg`} data-spine-header>
                {spineHeader(spine.length, spine.length + pinned.length)}
              </h2>
              {plan.eligible > 0 ? (
                <Button
                  variant="secondary"
                  onClick={() => batchApprove.mutate()}
                  loading={batchApprove.isPending}
                  pendingLabel="Approving"
                  data-batch-approve
                >
                  {plan.excluded > 0
                    ? `Approve ${plan.eligible} ready · ${plan.excluded} stay with you`
                    : `Approve all ${plan.eligible}`}
                </Button>
              ) : null}
            </div>
          ) : null}

          {plan.excluded > 0 && spine.length > 0 ? (
            <div data-batch-exclusions>
              <ReasonLine>
                Anything held or still missing a picture stays here for you — I never clear those in
                a batch.
              </ReasonLine>
            </div>
          ) : null}

          {spine.map((s) => {
            const card = byId.get(s.id);
            if (!card || justSkipped.includes(s.id)) return null;
            return (
              <div key={s.id} data-ready-card={s.id}>
                <PostCard
                  contentType={contentTypeOf(card.item.contentType)}
                  body={card.item.body}
                  variants={card.variants.map(toVariantSummary)}
                  reason={card.item.reasonLine}
                  awaitingPicture={!s.hasPicture}
                  onApprove={() => approve.mutate({ itemId: s.id })}
                  onSkip={() => dispose(s.id)}
                />
              </div>
            );
          })}

          {/* CHTS-5: the reason is asked AFTER the card is gone from the count. */}
          {justSkipped.map((id) => (
            <div key={`why-${id}`} data-skip-reason={id}>
              <OptionalReason
                action="Skipped."
                onChoose={(choice: OptionalReasonChoice) => {
                  explainSkip(id, choice);
                  setJustSkipped((prev) => prev.filter((x) => x !== id));
                }}
                onDismiss={() => setJustSkipped((prev) => prev.filter((x) => x !== id))}
              />
            </div>
          ))}
        </>
      ) : undefined,

    terminus:
      spine.length === 0 && !stack.isLoading ? (
        <Card asArticle={false}>
          <CaughtUp
            weeks={0}
            summary={
              pinned.length > 0
                ? "That's the stack cleared — everything left needs you personally, above."
                : "That's everything. Nothing is waiting on you."
            }
            nextUp="Next up from me: your following week's drafts."
          />
        </Card>
      ) : undefined,
  };
}

/** The DS card takes the GEN-1 taxonomy union; the API hands back its string. */
function contentTypeOf(value: string): Parameters<typeof PostCard>[0]["contentType"] {
  return value as Parameters<typeof PostCard>[0]["contentType"];
}

/**
 * A variant as the card shows it. The skip REASON is carried through verbatim —
 * GENS-5 requires a skipped channel to state why, specifically; a fit badge with
 * no reason is the silent drop the gate exists to prevent.
 */
function toVariantSummary(v: {
  platform: string;
  fitVerdict: string;
  fitReason: string;
}): VariantSummary {
  const summary = { platform: v.platform, verdict: v.fitVerdict } as VariantSummary;
  return v.fitReason ? { ...summary, fitReason: v.fitReason } : summary;
}
