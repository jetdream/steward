/**
 * @implements DSS-6 v1 (input & form-control contract)
 *
 * Ported from `design/design-system/steward/preview/inputs.html`. Text inputs,
 * textareas, and the per-channel toggle, each rendering
 * default / focus / filled / disabled / error.
 *
 * The load-bearing rule is the error state: it pairs the danger border with a
 * TEXT reason and wires `aria-describedby` + `aria-invalid`, so the failure is
 * never carried by colour alone (DSS-4/DS-4). A red ring a colour-blind founder
 * cannot see is not an error state.
 */
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useId } from "react";

/** Shared field chrome: token-resolved, with the ink focus ring (never accent). */
const fieldBase = [
  "w-full font-body text-sm text-fg bg-surface",
  "border border-border rounded-sm px-4 py-3",
  "outline-none focus:border-fg focus:shadow-[var(--focus-ring)]",
  "disabled:bg-surface-warm disabled:text-meta disabled:cursor-default",
  "placeholder:text-meta",
].join(" ");

const errorBorder = "border-danger";

/** The parts every field shares: an optional label, an error, and help text. */
interface FieldShellProps {
  label?: string;
  /** The text reason for a failure. Its presence IS the error state (DSS-6). */
  error?: string;
  /** Standing guidance shown when there is no error (e.g. the redirect note). */
  helpText?: ReactNode;
}

/** Renders label + control + the single message slot, wired for a11y. */
function FieldShell({
  label,
  error,
  helpText,
  controlId,
  messageId,
  children,
}: FieldShellProps & { controlId: string; messageId: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={controlId} className="font-body text-xs font-semibold text-muted">
          {label}
        </label>
      ) : null}
      {children}
      {/* One message slot: the error replaces the help text, never stacks with it. */}
      {error ? (
        <p id={messageId} className="font-body text-xs text-danger">
          {error}
        </p>
      ) : helpText ? (
        <p id={messageId} className="font-body text-sm text-muted">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id">,
    FieldShellProps {}

/** A single-line text input (DSS-6). */
export function TextField({ label, error, helpText, ...rest }: TextFieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  const described = error || helpText ? messageId : undefined;
  return (
    <FieldShell
      controlId={id}
      messageId={messageId}
      {...(label !== undefined ? { label } : {})}
      {...(error !== undefined ? { error } : {})}
      {...(helpText !== undefined ? { helpText } : {})}
    >
      <input
        id={id}
        className={`${fieldBase} ${error ? errorBorder : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
        {...rest}
      />
    </FieldShell>
  );
}

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "id">,
    FieldShellProps {}

/**
 * A multi-line input — the redirect box and the inline draft editor (DSS-6).
 * The redirect box pairs it with the confirm-back help text, since a redirect
 * becomes a permanent rule (CHTS-2).
 */
export function TextArea({ label, error, helpText, rows = 3, ...rest }: TextAreaProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  const described = error || helpText ? messageId : undefined;
  return (
    <FieldShell
      controlId={id}
      messageId={messageId}
      {...(label !== undefined ? { label } : {})}
      {...(error !== undefined ? { error } : {})}
      {...(helpText !== undefined ? { helpText } : {})}
    >
      <textarea
        id={id}
        rows={rows}
        className={`${fieldBase} ${error ? errorBorder : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
        {...rest}
      />
    </FieldShell>
  );
}

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  /** Why this option is off/unavailable — e.g. a GENS-5 channel skip reason. */
  reason?: string;
  disabled?: boolean;
}

/**
 * The per-channel toggle (DSS-6): a real checkbox for keyboard + screen-reader
 * semantics, styled from tokens. When a channel is skipped, its `reason` shows
 * beside it — GENS-5 requires the skip to be visible and specific, never a
 * silently-off switch.
 */
export function Toggle({ checked, onChange, label, reason, disabled = false }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex min-h-[44px] items-center gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--accent)] outline-none focus-visible:shadow-[var(--focus-ring)] disabled:cursor-default"
      />
      <label htmlFor={id} className="font-body text-sm text-fg">
        {label}
      </label>
      {reason ? <span className="font-body text-xs text-muted">{reason}</span> : null}
    </div>
  );
}
