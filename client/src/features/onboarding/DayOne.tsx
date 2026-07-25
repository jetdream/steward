/**
 * @implements ONBS-2 v1  (source ingestion — named or confirmed, never silent)
 * @implements ONBS-3 v1  (the gap model drives the questions — never a checklist)
 * @implements ONBS-5 v1  (the "here's what I know" review; corrections are permanent)
 * @implements ONBS-6 v1  (the honest readiness line — thin never blocks)
 * @implements INTS-1 v1  (gap-driven open questions)
 * @implements INTS-2 v1  (resumable session; every answer lands in Memory)
 *
 * **Day one, in the home's own regions** — journey XO-1 through flows XO-2
 * (arrival & watch it learn) and XO-3 (the first conversation), rendered as the
 * day-one SHAPE of XH-12 rather than a screen of its own. Same chrome, same four
 * regions, different density: there is no wizard, no checklist and no gate
 * anywhere here, which is the point of the whole flow (VAL-6, R-10).
 *
 * Pixels follow `design/mockups/exp-1-day-one/round-1/Day One (three moments).html`
 * (founder-approved) for treatment. ORDER follows XH-12, which is newer: the
 * mockup predates the region formalization and renders one undivided phone
 * stream, so where the two disagree the region contract wins —
 *
 *   READY        the day-one work: arrival, findings, the review card
 *   CONVERSATION the interview — transcript + questions + the answer box
 *   TERMINUS     what happens next, honestly
 *
 * **Two places where the truth is narrower than the mockup, deliberately:**
 *
 * 1. **Ingestion is PROPOSED, not already running.** Moment 1 shows Steward
 *    mid-read at minute 0. It can only be mid-read if it knows a source, and the
 *    doorstep collects name + email (ONB-1) — nothing else. So the address's
 *    domain becomes a one-tap PROPOSAL ("I think this is you") with a decline
 *    that routes to naming a site or straight to the interview (XO-2's
 *    no-sources state). ONBS-1's rule that a derived match is confirmed before
 *    it binds is exactly this situation; reading a guessed website silently
 *    would be the version of "already working" that reads someone else's site.
 * 2. **The 501(c)(3) verification line is absent.** Same recorded deferral as the
 *    doorstep's EIN field: no lookup exists, so "verification pending" would
 *    promise a check that never runs.
 */
import { useState } from "react";
import { useInterviewer } from "../../api/useInterviewer.js";
import { useOnboarding } from "../../api/useOnboarding.js";
import {
  AssumedNote,
  Button,
  Card,
  ChatMessage,
  Narration,
  TextArea,
  TextField,
  typeRole,
} from "../../ds/index.js";
import { proposedSiteFromEmail, toFindings } from "./dayOne.js";

/** How many findings the arrival stream shows before the review card takes over. */
const FINDINGS_SHOWN = 6;

export interface DayOneProps {
  /** The founder's address — the only thing a site proposal can be derived from. */
  email: string | undefined;
  orgName: string | undefined;
}

/** What the day-one home renders into each region. */
export interface DayOneRegions {
  ready: React.ReactNode;
  conversation: React.ReactNode;
  terminus: React.ReactNode;
}

/**
 * The day-one regions, as a hook rather than a component: `Home` owns the region
 * landmarks and their inertness (DSS-24), so a day-one "screen" wrapping them
 * would put a div between a region and its content and break that contract.
 */
export function useDayOne({ email, orgName }: DayOneProps): DayOneRegions {
  const { profile, ready, ingest, correct } = useOnboarding();
  // Resumption (INTS-2) lives entirely inside the hook — see useInterviewer.
  const interview = useInterviewer();

  return {
    ready: (
      <Arrival
        orgName={orgName}
        email={email}
        entries={profile.data ?? []}
        loading={profile.isLoading}
        ingesting={ingest.isPending}
        ingestFailed={ingest.isError}
        onRead={(siteUrl) => ingest.mutate({ siteUrls: [siteUrl] })}
        onCorrect={(text) => correct.mutate({ text })}
        correcting={correct.isPending}
      />
    ),
    conversation: (
      <Interview
        transcript={interview.transcript.data ?? []}
        busy={interview.asking}
        answering={interview.replying}
        onAsk={() => void interview.ask()}
        onAnswer={interview.reply}
      />
    ),
    terminus: <NextUp note={ready.data?.note} />,
  };
}

// ── READY region: arrival, findings, and the review (XO-2 / ONBS-2 / ONBS-5) ──

function Arrival({
  orgName,
  email,
  entries,
  loading,
  ingesting,
  ingestFailed,
  onRead,
  onCorrect,
  correcting,
}: {
  orgName: string | undefined;
  email: string | undefined;
  entries: ReadonlyArray<{
    id: string;
    kind: string;
    subject: string | null;
    content: string;
    assumed: boolean;
  }>;
  loading: boolean;
  ingesting: boolean;
  ingestFailed: boolean;
  onRead: (siteUrl: string) => void;
  onCorrect: (text: string) => void;
  correcting: boolean;
}) {
  const findings = toFindings(entries, FINDINGS_SHOWN);
  const nothingLearnedYet = findings.length === 0;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className={`${typeRole.display} text-fg`}>
          {orgName ? `Good to meet you, ${orgName}.` : "Good to meet you."}
        </h1>
        <p className={`${typeRole.secondary} text-muted`}>
          Nothing here needs filling in. Tell me where to read and I'll get started — or just talk
          to me below.
        </p>
      </div>

      {ingesting ? (
        <Narration
          live
          headline="I'm reading your site now."
          detail="Learning your voice, your programs, your people. Findings land here as I go."
        />
      ) : (
        <SourceProposal email={email} failed={ingestFailed} onRead={onRead} />
      )}

      {loading && nothingLearnedYet ? (
        <Narration headline="Looking at what I already know about you." />
      ) : null}

      {findings.length > 0 ? (
        <Card asArticle={false}>
          <p className={`${typeRole.meta} uppercase tracking-widest text-meta`}>
            Here's what I know so far
          </p>
          <ul className="flex flex-col gap-2">
            {findings.map((f) => (
              <li key={f.id} className={`${typeRole.secondary} text-fg`}>
                <span className={`${typeRole.meta} uppercase tracking-widest text-meta`}>
                  {f.kind}
                </span>{" "}
                {f.text}
              </li>
            ))}
          </ul>
          {/* ONBS-5: every inference is marked and correctable in one tap, and the
              correction becomes a permanent rule — not a one-off edit. */}
          {findings.some((f) => f.assumed) ? (
            <AssumedNote onCorrect={focusCorrectionBox}>
              Some of this I inferred rather than being told.
            </AssumedNote>
          ) : null}
          <CorrectionBox onCorrect={onCorrect} busy={correcting} />
        </Card>
      ) : null}
    </>
  );
}

/**
 * Send the founder to the correction field. Located by its data hook rather than
 * an id, because DSS-6 controls own their `id` (they generate one to wire the
 * label and `aria-describedby`) — reaching in with one would silently break that
 * pairing. The AssumedNote's tap must land somewhere: a marker with no
 * correction path is a disclosure that reads as a dead end (DSS-11).
 */
function focusCorrectionBox(): void {
  document.querySelector<HTMLTextAreaElement>("[data-correction]")?.focus();
}

function CorrectionBox({ onCorrect, busy }: { onCorrect: (text: string) => void; busy: boolean }) {
  const [text, setText] = useState("");
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const t = text.trim();
        if (!t) return;
        onCorrect(t);
        setText("");
      }}
    >
      <TextArea
        label="Fix anything"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="We're not in Travis County — we serve Hays County."
        helpText="A correction here is a rule I keep from now on, everywhere."
        data-correction
      />
      <div>
        <Button type="submit" variant="secondary" loading={busy} pendingLabel="Filing that">
          Tell me
        </Button>
      </div>
    </form>
  );
}

/**
 * The source proposal (ONBS-2). Derived from the address when it looks like the
 * org's own domain, and always declinable — the founder can name a different
 * site or skip reading entirely, in which case the interview is the primary path
 * (XO-2's no-sources state, honestly framed rather than a dead end).
 */
function SourceProposal({
  email,
  failed,
  onRead,
}: {
  email: string | undefined;
  failed: boolean;
  onRead: (siteUrl: string) => void;
}) {
  const proposed = proposedSiteFromEmail(email);
  const [site, setSite] = useState(proposed ?? "");
  const [naming, setNaming] = useState(proposed === null);

  const start = () => {
    const url = site.trim();
    if (url) onRead(url.startsWith("http") ? url : `https://${url}`);
  };

  return (
    <Card asArticle={false}>
      {failed ? (
        <p className={`${typeRole.secondary} text-fg`}>
          Your site wouldn't load, so I've learned nothing from it yet. I can try again — and
          meanwhile, talking to me below works just as well.
        </p>
      ) : null}
      {!naming && proposed ? (
        <>
          <p className={`${typeRole.body} text-fg`}>
            I think this is you — <strong className="font-semibold">{proposed}</strong>. Shall I
            read it?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={start} data-start-reading>
              Yes, start reading
            </Button>
            <Button variant="quiet" onClick={() => setNaming(true)}>
              That's not us
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className={`${typeRole.body} text-fg`}>Where can I read about you?</p>
          <TextField
            label="Your website"
            type="url"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="hopeandpaws.org"
            helpText="Public pages only, and only what you'd show a visitor. Skip it if you'd rather just talk — I'll learn from you instead."
            data-site-url
          />
          <div>
            <Button variant="primary" onClick={start} data-start-reading>
              Start reading
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

// ── CONVERSATION region: the interview in the stream (XO-3 / INTS-1/2) ──

function Interview({
  transcript,
  busy,
  answering,
  onAsk,
  onAnswer,
}: {
  transcript: ReadonlyArray<{ id: string; role: string; content: string }>;
  busy: boolean;
  answering: boolean;
  onAsk: () => void;
  onAnswer: (answer: string) => void;
}) {
  const [text, setText] = useState("");
  const askedYet = transcript.length > 0;

  return (
    <>
      {transcript.map((m) => (
        <ChatMessage key={m.id} author={m.role === "assistant" ? "steward" : "founder"}>
          {m.content}
        </ChatMessage>
      ))}

      {!askedYet ? (
        <Narration
          headline="Want to tell me something no website says?"
          detail="A couple of questions is all it takes — the answers are what make your posts sound like you."
          action={
            <Button variant="secondary" onClick={onAsk} loading={busy} pendingLabel="Thinking">
              Ask me something
            </Button>
          }
        />
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const t = text.trim();
            if (!t) return;
            onAnswer(t);
            setText("");
          }}
        >
          <TextArea
            label="Your answer"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="A sentence is plenty."
            data-interview-answer
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" loading={answering} pendingLabel="Filing that">
              Send
            </Button>
            <Button type="button" variant="quiet" onClick={onAsk} loading={busy}>
              Ask me something else
            </Button>
          </div>
        </form>
      )}
    </>
  );
}

// ── TERMINUS: what happens next (ONBS-6, honest about thin) ──

function NextUp({ note }: { note: string | undefined }) {
  return (
    <Narration
      headline="What happens next"
      detail={
        note?.startsWith("minimum viable context")
          ? "I know enough to start writing. Your first drafts arrive here — nothing publishes without your yes."
          : "I'm still thin on you. Point me at your site or answer a question or two, and your first drafts follow — I'd rather write nothing than invent something about your work."
      }
    />
  );
}
