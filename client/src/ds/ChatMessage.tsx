/**
 * @implements DSS-21 v1 (chat-message contract)
 *
 * Ported from `design/design-system/steward/preview/chat-message.html`. The
 * colleague-presence row, not a support widget: spacious rhythm, first-person
 * voice (VAL-5), and real org content rendered as rich inline cards — a draft,
 * a photo, a strategy snippet — rather than a link out of the conversation.
 *
 * The asymmetry is the point. Steward's turns are avatar + named body on the
 * canvas; the founder's are a compact warm-surface bubble, right-aligned. Only
 * the founder's turn is "a bubble", because the colleague is *present* in the
 * stream rather than talking at you from inside a chat client.
 */
import type { ReactNode } from "react";

export type ChatAuthor = "steward" | "founder";

export interface ChatMessageProps {
  author: ChatAuthor;
  children: ReactNode;
  /**
   * Rich inline content — a draft preview, a photo, a strategy snippet. Rendered
   * INSIDE the turn so the conversation carries the work itself (DSS-21), never
   * a link that leaves the stream.
   */
  attachment?: ReactNode;
}

/** One conversation turn (DSS-21). */
export function ChatMessage({ author, children, attachment }: ChatMessageProps) {
  if (author === "founder") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-md bg-surface-warm px-4 py-3 font-body text-base text-fg">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex max-w-[92%] gap-3">
      <span
        aria-hidden="true"
        className="flex size-9 flex-none items-center justify-center rounded-pill bg-fg font-body text-sm font-semibold text-bg"
      >
        S
      </span>
      <div className="flex flex-col gap-2">
        <span className="font-body text-xs font-semibold text-muted">Steward</span>
        <div className="font-body text-base text-fg">{children}</div>
        {attachment}
      </div>
    </div>
  );
}

export interface InlineWorkCardProps {
  title: string;
  /** The plain-language "what this is / when it arrives" line. */
  note: string;
  thumbnailSrc?: string | undefined;
}

/**
 * The rich inline card a Steward turn can carry (DSS-21) — a draft, a photo, a
 * snippet. Composed from existing primitives; it introduces no new visual value
 * (GR-7).
 */
export function InlineWorkCard({ title, note, thumbnailSrc }: InlineWorkCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      {thumbnailSrc ? (
        <img
          src={thumbnailSrc}
          alt=""
          className="h-11 w-14 flex-none rounded-sm object-cover"
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true" className="h-11 w-14 flex-none rounded-sm bg-surface-warm" />
      )}
      <span className="font-body text-sm">
        <strong className="font-semibold text-fg">{title}</strong>
        <br />
        <span className="text-muted">{note}</span>
      </span>
    </div>
  );
}
