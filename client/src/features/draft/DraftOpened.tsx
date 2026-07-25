/**
 * @implements APRS-1 v3 (the deep review — per-channel variants, fit, dispositions)
 * @implements APRS-3 v1 (raw inline edit, diffed for the learning loop)
 *
 * **Screen XH-13 v2 — the draft, opened.** A Ready card expanded for deep
 * review, rendered into the DSS-24 summoned pane: beside the home on desktop
 * with the stream's place kept, a takeover on phone, one "back to Steward"
 * gesture. The pane mechanics belong to `SummonedSurface`; this is only its
 * body.
 *
 * Pixels follow frame 2 of
 * `design/mockups/exp-38-home/round-1/Steward Home (desktop).html`.
 *
 * **A skipped channel keeps its tab.** GENS-5 retains a skipped variant WITH its
 * reason so the founder can see the omission and override it — filtering those
 * tabs out would turn a visible decision into a silent one, on the screen built
 * for looking closely.
 *
 * **NOT-YET, stated rather than faked:**
 * - **Adjust (guided)** — CHTS-5's guided redraft has no backend: there is no
 *   procedure that offers "warmer? shorter? lead with the kids?" and redraws.
 *   Rendering the options with nothing behind them is the fake control VAL-6
 *   forbids, so the verb says what it is waiting for. Edit (raw) and Redirect
 *   are both live in the meantime.
 * - **Undo after approve** — APRS-1's recall (approved → draft while still
 *   pending) has no procedure either. Approving here is final until publish, so
 *   the pane does not offer an undo it cannot honour.
 * - The NEWS long-form variant, its topic tags and ArticleLink badges ride with
 *   `@news`, which is out of this phase's scope.
 */
import { useState } from "react";
import { useApproval } from "../../api/useApproval.js";
import {
  ApprovePanel,
  Button,
  Card,
  FitReason,
  Narration,
  PhotoSlot,
  ReasonLine,
  type ScheduleRow,
  TextArea,
  typeRole,
  VariantTablist,
} from "../../ds/index.js";
import { type DraftVariant, defaultVariant, scheduleLines } from "./draft.js";

/** The item + variants the pane renders, as the API returns them. */
interface OpenCard {
  item: {
    id: string;
    title: string;
    body: string;
    reasonLine: string;
    valSummary: string;
    escalated: boolean;
    mediaAssetId: string | null;
  };
  variants: readonly DraftVariant[];
}

/** The channel union the tablist takes — the API hands back its string. */
type TabPlatform = Parameters<typeof VariantTablist>[0]["tabs"][number]["platform"];
type TabVerdict = Parameters<typeof VariantTablist>[0]["tabs"][number]["verdict"];

/**
 * The opened-draft pane body (XH-13). Returns a narration while the stack is
 * loading or once the item is gone — a card disposed of from underneath the pane
 * should say so, not render a husk.
 */
export function DraftOpened({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const { stack, approve, skip, editDraft, redirect } = useApproval();
  const card = ((stack.data ?? []) as OpenCard[]).find((c) => c.item.id === itemId);

  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [redirectText, setRedirectText] = useState("");

  if (stack.isLoading) return <Narration headline="Opening it up." />;
  if (!card) {
    return (
      <Narration
        headline="That one is no longer in your stack."
        detail="You approved or skipped it. Nothing is lost — it's in Plan & Published."
        action={
          <Button variant="secondary" onClick={onClose}>
            Back to Steward
          </Button>
        }
      />
    );
  }

  const active =
    card.variants.find((v) => v.platform === selected) ?? defaultVariant(card.variants);
  const rows = scheduleLines(card.variants) as ScheduleRow[];
  const blocked = card.item.mediaAssetId === null;

  return (
    <div className="flex flex-col gap-4">
      {/* The master, large — the thing being reviewed leads (XH-13). */}
      <Card asArticle={false} elevation="flat">
        <h3 className={`${typeRole.cardTitle} text-fg`} data-draft-title>
          {card.item.title}
        </h3>
        <PhotoSlot
          {...(card.item.mediaAssetId ? {} : { emptyLabel: "No photo attached yet" })}
          alt=""
        />
        <p className={`${typeRole.body} text-fg`} data-master-body>
          {card.item.body}
        </p>
        <ReasonLine>{card.item.reasonLine}</ReasonLine>
        {card.item.escalated && card.item.valSummary ? (
          <ReasonLine>{card.item.valSummary}</ReasonLine>
        ) : null}
      </Card>

      {/* Per-channel variants — EVERY channel keeps its tab, skipped included. */}
      {card.variants.length > 0 && active ? (
        <div className="flex flex-col gap-3" data-variants>
          <VariantTablist
            tabs={card.variants.map((v) => ({
              platform: v.platform as TabPlatform,
              verdict: v.fitVerdict as TabVerdict,
            }))}
            selected={active.platform as TabPlatform}
            onSelect={(p) => setSelected(p)}
          />
          <Card asArticle={false} elevation="ring">
            <p className={`${typeRole.secondary} text-fg`} data-variant-body>
              {active.body}
            </p>
            {active.fitVerdict === "skipped" ? (
              <FitReason
                platform={active.platform as TabPlatform}
                reason={active.fitReason || "it does not fit this channel"}
              />
            ) : null}
          </Card>
        </div>
      ) : null}

      {/* Raw inline edit — the power move beside the (not-yet) guided Adjust. */}
      {editing ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const text = draftText.trim();
            if (!text) return;
            editDraft.mutate({ itemId, text }, { onSuccess: () => setEditing(false) });
          }}
        >
          <TextArea
            label="Edit the words"
            rows={6}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            helpText="I keep track of what you change, so I write closer to this next time."
            data-edit-body
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="secondary" loading={editDraft.isPending}>
              Save the edit
            </Button>
            <Button type="button" variant="quiet" onClick={() => setEditing(false)}>
              Never mind
            </Button>
          </div>
        </form>
      ) : null}

      {redirecting ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const text = redirectText.trim();
            if (!text) return;
            redirect.mutate(
              { itemId, text },
              {
                onSuccess: () => {
                  setRedirecting(false);
                  setRedirectText("");
                },
              },
            );
          }}
        >
          <TextArea
            label="Tell me what to change about how I write these"
            rows={3}
            value={redirectText}
            onChange={(e) => setRedirectText(e.target.value)}
            helpText="This becomes a standing rule, not a one-off edit."
            data-redirect-body
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="secondary" loading={redirect.isPending}>
              Remember that
            </Button>
            <Button type="button" variant="quiet" onClick={() => setRedirecting(false)}>
              Never mind
            </Button>
          </div>
        </form>
      ) : null}

      {/* The schedule + the single accent verb (DSS-20, DS-2). */}
      <ApprovePanel
        rows={rows}
        onApprove={() => approve.mutate({ itemId }, { onSuccess: onClose })}
        reason="I picked times when your followers are usually around."
        {...(blocked ? { approveBlockedReason: "It still needs a picture." } : {})}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setDraftText(card.item.body);
            setEditing(true);
          }}
          data-open-edit
        >
          Edit the words
        </Button>
        <Button variant="secondary" onClick={() => setRedirecting(true)} data-open-redirect>
          Redirect
        </Button>
        <Button
          variant="quiet"
          onClick={() => skip.mutate({ itemId }, { onSuccess: onClose })}
          loading={skip.isPending}
          data-pane-skip
        >
          Skip
        </Button>
        {/* NOT-YET — stated, never a control that does nothing. */}
        <Button variant="quiet" disabled data-adjust-unavailable>
          Adjust (I can't talk you through a rewrite yet)
        </Button>
      </div>
    </div>
  );
}
