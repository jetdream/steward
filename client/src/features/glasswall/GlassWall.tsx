/**
 * @implements UXS-4 v1 (Plan & Published — one click, pull-only)
 * @implements UXS-5 v1 (Knowledge & How-I-write — one click, plain-labeled)
 * @implements UXS-8 v1 (Discoveries — pull-only by rule)
 *
 * **The glass wall** — the four views the founder can open at any time without
 * asking (`XG-6` Knowledge, `XG-7` How I write, `XG-8` Plan & Published, `XG-9`
 * Discoveries), rendered into the DSS-24 summoned pane.
 *
 * Pixels: `design/mockups/exp-41-44-glass-wall/round-2/Glass Wall v2 (four
 * views).html`; How-I-write from `exp-42-45-46-47-founder-surfaces/round-1/`.
 *
 * **Pull-only is a NEGATIVE contract, and it is the whole point.** VAL-3 made
 * these views permanent and one click away so trust never depends on asking;
 * UXS-4/8 add that they must never badge, count or nudge. Every affordance here
 * is therefore something the founder chose to look at — nothing in this file
 * announces itself, and the chrome that links to it carries no dot (asserted by
 * US-1). A count here would quietly convert a transparency guarantee into an
 * obligation, which is the one thing a time-poor founder cannot afford (G-3).
 *
 * **Reads, with two founder-initiated writes:** editing the strategy (STRS-2 —
 * an org rule routes to Memory rather than the doc, DEC-22) and triaging a
 * discovery (EXTS-5). Neither creates a task.
 */
import {
  channelPlatformLabels,
  editorialStateLabels,
  gapCategoryLabels,
  memoryEntryKindLabels,
} from "@shared";
import { useState } from "react";
import { useDiscoveries, usePlan, useStrategy } from "../../api/useGlassWall.js";
import { useInterviewer } from "../../api/useInterviewer.js";
import { useOnboarding } from "../../api/useOnboarding.js";
import {
  Button,
  Card,
  CitationBlock,
  Narration,
  ReasonLine,
  TextArea,
  typeRole,
} from "../../ds/index.js";
import type { LookInsideView } from "../shell/Chrome.js";

/** The pane body for whichever glass-wall view was summoned. */
export function GlassWall({ view }: { view: LookInsideView }) {
  if (view === "knowledge") return <Knowledge />;
  if (view === "how-i-write") return <HowIWrite />;
  if (view === "plan") return <PlanAndPublished />;
  return <Discoveries />;
}

// ── XG-6 Knowledge — what Steward knows, and what it still wants to ask ──

function Knowledge() {
  const { profile } = useOnboarding();
  const { openQuestions } = useInterviewer();
  const entries = profile.data ?? [];
  const open = openQuestions.data ?? [];

  if (profile.isLoading) return <Narration headline="Getting what I know together." />;

  return (
    <div className="flex flex-col gap-4" data-view="knowledge">
      {entries.length === 0 ? (
        <Narration
          headline="I don't know anything about you yet."
          detail="Point me at your website or answer a couple of questions and this fills up."
        />
      ) : (
        <ul className="flex flex-col gap-2" data-knowledge-entries>
          {entries.map((e) => (
            <li key={e.id} className="flex flex-col gap-1 border-b border-border-soft pb-2">
              <span className={`${typeRole.meta} uppercase tracking-widest text-meta`}>
                {memoryEntryKindLabels[e.kind]}
                {e.assumed ? " · assumed" : ""}
              </span>
              <span className={`${typeRole.secondary} text-fg`}>{e.content}</span>
            </li>
          ))}
        </ul>
      )}

      {/* UXS-5: Knowledge HOSTS the INT-4 open-questions list. Never blocking —
          it is an invitation, not a task list (R-10). */}
      {open.length > 0 ? (
        <Card asArticle={false} data-open-questions>
          <p className={`${typeRole.meta} uppercase tracking-widest text-meta`}>
            Help me understand you
          </p>
          <ul className="flex flex-col gap-2">
            {open.map((q) => (
              <li key={q.category} className={`${typeRole.secondary} text-fg`}>
                <strong className="font-semibold">{gapCategoryLabels[q.category]}</strong> — {q.why}
              </li>
            ))}
          </ul>
          <ReasonLine>Answer any of these in the conversation whenever you like.</ReasonLine>
        </Card>
      ) : null}
    </div>
  );
}

// ── XG-7 How I write — the five-section Strategy ──

/** The five sections, in the STRS-1 order, with the labels a founder reads. */
const SECTIONS = [
  { id: "a", label: "What I post about" },
  { id: "b", label: "How you sound" },
  { id: "c", label: "What I never do" },
  { id: "d", label: "Standing instructions" },
  { id: "e", label: "Per channel" },
] as const;

function HowIWrite() {
  const { strategy, edit } = useStrategy();
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState("");
  const s = strategy.data;

  if (strategy.isLoading || !s) return <Narration headline="Fetching how I write for you." />;

  const bodyOf = (id: string): string => {
    if (id === "a") return s.sectionA;
    if (id === "b") return s.sectionB;
    if (id === "d") return s.sectionD;
    if (id === "e") {
      return Object.entries(s.sectionE)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    }
    return "";
  };

  return (
    <div className="flex flex-col gap-4" data-view="how-i-write">
      <p className={`${typeRole.secondary} text-muted`} data-strategy-version>
        {s.version === null ? "Not written down yet" : `Version ${s.version}`}
      </p>

      {SECTIONS.map((section) => (
        <Card asArticle={false} key={section.id} data-strategy-section={section.id}>
          <p className={`${typeRole.meta} uppercase tracking-widest text-meta`}>{section.label}</p>

          {section.id === "c" ? (
            // (c) is a VIEW, never a stored copy (DEC-22): the platform
            // guardrails plus the live Memory overlay. Editing it here would
            // create the second store that decision exists to prevent, so this
            // section is read-only and says where its rules come from.
            <>
              <ul className="flex flex-col gap-1">
                {[...s.sectionC.platform, ...s.sectionC.org].map((rule) => (
                  <li key={rule} className={`${typeRole.secondary} text-fg`}>
                    {rule}
                  </li>
                ))}
              </ul>
              <ReasonLine>
                These come from your own corrections and from rules I keep for every organization —
                tell me a new one in the conversation and it lands here.
              </ReasonLine>
            </>
          ) : editing === section.id ? (
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const next = text.trim();
                if (!next) return;
                edit.mutate(
                  { section: section.id, text: next },
                  { onSuccess: () => setEditing(null) },
                );
              }}
            >
              <TextArea
                label={section.label}
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                helpText="Every change is versioned, and it applies to the next thing I write."
                data-strategy-edit
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="secondary" loading={edit.isPending}>
                  Save
                </Button>
                <Button type="button" variant="quiet" onClick={() => setEditing(null)}>
                  Never mind
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p className={`${typeRole.secondary} text-fg`}>
                {bodyOf(section.id) || "Nothing here yet."}
              </p>
              <div>
                <Button
                  variant="quiet"
                  onClick={() => {
                    setText(bodyOf(section.id));
                    setEditing(section.id);
                  }}
                  data-edit-section={section.id}
                >
                  Change this
                </Button>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── XG-8 Plan & Published — what is coming, and what went out ──

function PlanAndPublished() {
  const { plan, log } = usePlan();
  const items = plan.data ?? [];
  const published = log.data ?? [];

  if (plan.isLoading) return <Narration headline="Pulling your plan together." />;

  return (
    <div className="flex flex-col gap-4" data-view="plan">
      <section className="flex flex-col gap-2">
        <h3 className={`${typeRole.cardTitle} text-fg`}>Coming up</h3>
        {items.length === 0 ? (
          <Narration headline="Nothing planned yet — I'll fill this as I learn about you." />
        ) : (
          <ul className="flex flex-col gap-2" data-plan-items>
            {items.map((i) => (
              <li key={i.id} className="flex flex-col gap-0.5 border-b border-border-soft pb-2">
                <span className={`${typeRole.secondary} text-fg`}>{i.title}</span>
                <span className={`${typeRole.meta} uppercase tracking-widest text-meta`}>
                  {editorialStateLabels[i.editorialState]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className={`${typeRole.cardTitle} text-fg`}>Already out</h3>
        {published.length === 0 ? (
          // Honest rather than empty: nothing has published, and saying so is
          // not the same as an error (DS-6).
          <Narration headline="Nothing has gone out yet. When it does, every post is listed here with its link." />
        ) : (
          <ul className="flex flex-col gap-2" data-publish-log>
            {published.map((entry) => (
              <li key={entry.variantId} className="flex flex-col gap-0.5">
                <span className={`${typeRole.meta} uppercase tracking-widest text-meta`}>
                  {channelPlatformLabels[entry.platform]}
                </span>
                <span className={`${typeRole.secondary} text-fg`}>{entry.text}</span>
                <a
                  href={entry.url}
                  className={`${typeRole.secondary} text-muted underline decoration-dotted underline-offset-2`}
                  target="_blank"
                  rel="noreferrer"
                >
                  See it live
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ── XG-9 Discoveries — the pull-only external feed ──

/** The three read-first dispositions (EXTS-5), in founder language. */
const TRIAGE = [
  { id: "worth-a-post", label: "Worth a post" },
  { id: "saved-for-later", label: "Save for later" },
  { id: "not-for-us", label: "Not for us" },
] as const;

function Discoveries() {
  const { discoveries, triage } = useDiscoveries();
  const items = discoveries.data ?? [];

  if (discoveries.isLoading) return <Narration headline="Looking at what I've found." />;

  return (
    <div className="flex flex-col gap-4" data-view="discoveries">
      <ReasonLine>
        Things I found that might be worth saying something about. Nothing here is waiting on you —
        read it when you feel like it.
      </ReasonLine>

      {items.length === 0 ? (
        <Narration
          headline="Nothing found yet."
          detail="I look for things going on in your world once I know what you care about."
        />
      ) : (
        <ul className="flex flex-col gap-3" data-discoveries>
          {items.map((item) => (
            <li key={item.id}>
              <Card asArticle={false}>
                {/* READ-FIRST (EXTS-5): the headline, source and summary come
                    BEFORE any ask — the founder reads, then disposes. */}
                <p className={`${typeRole.cardTitle} text-fg`}>{item.title}</p>
                <p className={`${typeRole.secondary} text-fg`} data-discovery-summary>
                  {item.summary}
                </p>
                <CitationBlock source={item.source} url={item.url} />
                <div className="flex flex-wrap gap-2">
                  {TRIAGE.map((t) => (
                    <Button
                      key={t.id}
                      variant="quiet"
                      onClick={() => triage.mutate({ id: item.id, disposition: t.id })}
                      data-triage={t.id}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
