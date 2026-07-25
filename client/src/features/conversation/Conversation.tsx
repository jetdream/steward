/**
 * @implements UXS-2 v1  (the conversation IS the home's medium, not a route)
 * @implements CHTS-1 v1 (grounded answers; the GR-2 decline and the honest unknown)
 * @implements CHTS-2 v1 (a redirect is confirmed back BEFORE it binds)
 * @implements CHTS-4 v1 (every system-initiated message carries its reason)
 * @implements CHTS-5 v1 (never blank — Steward leads, the founder answers)
 *
 * **Region 3 of XH-12**, and the only conversation surface in the product. There
 * is no chat page: DEC-18 fused the chat page and the docked companion into this
 * region, so interviewer questions, answers, and redirects all appear here,
 * inline, on ONE session shared with the interviewer.
 *
 * **The composer's verb is declared, never inferred.** Three things a founder can
 * do with a sentence — ask, answer, or lay down a rule — and they are different
 * writes: asking writes nothing to Memory, answering writes a fact (INTS-2),
 * laying down a rule writes a permanent styleRule/taboo (CHTS-2). Telling them
 * apart is a semantic judgment, and getting it wrong in the BINDING direction
 * gives the org a permanent rule nobody asked for. So the founder picks the verb
 * (LRN-20: no classifier where an affordance will do).
 *
 * **The redirect gate is two steps and is not a formality.** "Make this a rule"
 * fetches Steward's interpretation and binds NOTHING; only Confirm writes. A
 * single-step version would look identical until the day it mis-reads an
 * instruction and enforces it on every future draft.
 */
import { useState } from "react";
import { useChat } from "../../api/useChat.js";
import { useInterviewer } from "../../api/useInterviewer.js";
import {
  Button,
  Card,
  ChatMessage,
  Narration,
  ReasonLine,
  TextArea,
  typeRole,
} from "../../ds/index.js";
import { canSend, leadingOpenings } from "./conversation.js";

/**
 * The conversation region (UXS-2). Rendered in BOTH home shapes — day one and
 * the weekly visit differ in what surrounds it, never in whether the founder can
 * talk.
 */
export function Conversation() {
  const interview = useInterviewer();
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const chat = useChat(interview.sessionId, pendingRedirect);

  const [text, setText] = useState("");
  /** The Steward turn the founder tapped Reply on — routes Send to Memory. */
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const transcript = interview.transcript.data ?? [];
  const hasOpenGaps = (interview.openQuestions.data ?? []).length > 0;
  const openings = leadingOpenings(chat.openings.data, hasOpenGaps);
  const answer = chat.lastAnswer;

  const send = async () => {
    if (!canSend(text)) return;
    const body = text.trim();
    setText("");
    if (replyingTo !== null) {
      setReplyingTo(null);
      await interview.reply(body);
    } else {
      // Resolve (or open) the shared session FIRST — see useChat.askOn.
      chat.askOn(await interview.ensureSession(), body);
    }
  };

  return (
    <>
      {transcript.map((m) =>
        m.role === "assistant" ? (
          <ChatMessage
            key={m.id}
            author="steward"
            attachment={
              // Reply is what routes an ANSWER to Memory rather than asking
              // Steward a question. Offered on every Steward turn because a
              // founder may answer something asked three turns ago.
              <Button variant="quiet" onClick={() => setReplyingTo(m.id)} data-reply-to={m.id}>
                Reply to this
              </Button>
            }
          >
            {m.content}
          </ChatMessage>
        ) : (
          <ChatMessage key={m.id} author="founder">
            {m.content}
          </ChatMessage>
        ),
      )}

      {/* CHTS-1's two honest states. They ride the LIVE answer: the transcript
          stores the text (which already carries the decline wording), so this
          marks WHY the answer reads as it does while it is fresh. */}
      {/* The hook goes on a WRAPPER, not on ReasonLine: DSS components take
          only their declared props, so a `data-*` passed to one is accepted by
          JSX and then silently dropped before the DOM — a selector that can
          never match. */}
      {answer?.declined ? (
        <div data-declined>
          <ReasonLine>
            That's a legal or tax question, so I won't answer it — your accountant or lawyer should.
          </ReasonLine>
        </div>
      ) : null}
      {answer?.isUnknown ? (
        <div data-unknown>
          <ReasonLine>
            I don't actually know that yet — I'd rather say so than guess. Tell me and I'll keep it.
          </ReasonLine>
        </div>
      ) : null}

      {pendingRedirect !== null ? (
        <RedirectConfirm
          interpretation={chat.redirectPreview.data?.interpretation}
          loading={chat.redirectPreview.isLoading}
          binding={chat.applyRedirect.isPending}
          onConfirm={() => {
            chat.applyRedirect.mutate(
              { text: pendingRedirect },
              { onSuccess: () => setPendingRedirect(null) },
            );
          }}
          onCancel={() => setPendingRedirect(null)}
        />
      ) : null}

      {transcript.length === 0 ? (
        <Narration
          headline="Talk to me like you'd talk to a colleague."
          detail="Ask what I'm working on, tell me something about your work, or let me ask you a couple of questions."
        />
      ) : null}

      {/* CHTS-5: the openings sit ABOVE the box, so the founder never meets an
          empty prompt. Each carries its reason (CHTS-4) rather than appearing as
          an unexplained suggestion. */}
      <div className="flex flex-col gap-2" data-openings>
        {openings.map((o) => (
          <div key={o.opening} className="flex flex-col gap-0.5">
            <Button
              variant="secondary"
              data-opening
              onClick={() => {
                if (o.kind === "interview") void interview.ask();
                else setText(o.opening);
              }}
            >
              {o.opening}
            </Button>
            <span className={`${typeRole.meta} font-normal text-meta`} data-opening-reason>
              {o.reason}
            </span>
          </div>
        ))}
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        {replyingTo !== null ? (
          <p className={`${typeRole.secondary} text-muted`} data-replying>
            Answering what I asked — this goes into what I know about you.{" "}
            <Button variant="quiet" type="button" onClick={() => setReplyingTo(null)}>
              Never mind
            </Button>
          </p>
        ) : null}
        <TextArea
          label={replyingTo !== null ? "Your answer" : "Ask or tell me anything"}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            replyingTo !== null ? "A sentence is plenty." : "What's going out this week?"
          }
          data-composer
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={!canSend(text)}
            loading={chat.asking || interview.replying}
            pendingLabel={replyingTo !== null ? "Filing that" : "Thinking"}
          >
            Send
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!canSend(text) || pendingRedirect !== null}
            onClick={() => setPendingRedirect(text.trim())}
            data-make-rule
          >
            Make this a rule
          </Button>
        </div>
      </form>
    </>
  );
}

/**
 * The CHTS-2 confirm-back. Nothing has been written when this renders — that is
 * the entire point of the step, so the copy says so plainly rather than
 * presenting a fait accompli with an undo.
 */
function RedirectConfirm({
  interpretation,
  loading,
  binding,
  onConfirm,
  onCancel,
}: {
  interpretation: string | undefined;
  loading: boolean;
  binding: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Card asArticle={false} elevation="ring" data-redirect-confirm>
      <p className={`${typeRole.meta} uppercase tracking-widest text-meta`}>Before I remember it</p>
      {loading || interpretation === undefined ? (
        <p className={`${typeRole.body} text-muted`}>Working out what you mean…</p>
      ) : (
        <p className={`${typeRole.body} text-fg`} data-interpretation>
          {interpretation}
        </p>
      )}
      <ReasonLine>
        Nothing is saved yet. Once you confirm, I'll keep to this on every future post until you
        tell me otherwise.
      </ReasonLine>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={interpretation === undefined}
          loading={binding}
          pendingLabel="Remembering"
          data-confirm-rule
        >
          Yes, remember that
        </Button>
        <Button variant="quiet" onClick={onCancel} data-cancel-rule>
          Not quite — cancel
        </Button>
      </div>
    </Card>
  );
}
