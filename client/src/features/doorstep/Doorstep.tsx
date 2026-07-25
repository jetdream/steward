/**
 * @implements ONBS-1 v1  (zero-homework signup: org name + email is enough)
 * @implements ACCS-1 v1  (sign-in yields the User; signup creates the triple)
 *
 * **Screen XO-6 — the doorstep.** The only surface a signed-out founder sees,
 * and the one in-scope screen with no founder-reviewed mockup: it is designed
 * here from the screen body plus the DSS inventory (GR-7), not invented.
 *
 * The screen body asks for four things, and each is honoured literally:
 *
 * | XO-6 clause | Here |
 * |---|---|
 * | org name + email (ONB-1) | the two fields, in that order, nothing else required |
 * | EIN optional with visible verification state | see NOT-YET below |
 * | consent in plain language (A-5) | stated as a sentence before the button, not a checkbox |
 * | "straight into the home's day-one shape — no profile wizard, no checklist" | one submit, no steps |
 *
 * **NOT-YET: the EIN field is deliberately absent.** ONBS-1's 501(c)(3)
 * verification is a recorded deferral (`backend/src/onboarding/CLAUDE.md` —
 * external-API bearing, ProPublica/IRS IG-6): there is no EIN column on DM-1 and
 * no registry lookup. An input we would discard, or a "verification pending"
 * chip for a check that will never run, is precisely the fake state VAL-6
 * forbids — the founder would read a promise we are not keeping. So the screen
 * says what is true, in one line, and asks for nothing it cannot use. The field
 * arrives with the lookup. (Same rule the Controls tray applies to cadence and
 * notifications.)
 *
 * **One form, two modes.** XO-6 makes sign-in "unremarkable and fast", so the
 * returning founder gets one field. New/returning is a founder-declared mode
 * rather than something inferred from the address: probing whether an email is
 * already registered would leak who banks with us to anyone with a guess.
 */
import { type FormEvent, useState } from "react";
import { Button, TextField, typeRole } from "../../ds/index.js";

/** Which of the two doorstep modes is showing. */
type Mode = "new" | "returning";

export interface DoorstepProps {
  /** Submits the doorstep. `orgName` is present only in the "new" mode. */
  onSubmit: (input: { email: string; orgName?: string }) => void;
  pending: boolean;
  /** A failed attempt, in plain language — never a status code. */
  error?: string | undefined;
}

/**
 * What Steward will do with the public presence it is being given permission to
 * read (A-5), and the promise that bounds it (GR-3: nothing publishes unapproved).
 * Stated as a sentence rather than a consent checkbox — a checkbox is a
 * liability ritual; a sentence is what a colleague would say.
 */
const CONSENT =
  "By starting, you're telling me I can read your public presence — your website and public posts — so I can learn who you are. Nothing private, and nothing gets published anywhere until you approve it.";

/** The doorstep screen (XO-6). */
export function Doorstep({ onSubmit, pending, error }: DoorstepProps) {
  const [mode, setMode] = useState<Mode>("new");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    const name = orgName.trim();
    onSubmit(mode === "new" && name ? { email: address, orgName: name } : { email: address });
  };

  return (
    <main
      data-screen="doorstep"
      className="mx-auto flex min-h-screen w-full max-w-[var(--home-measure)] flex-col justify-center gap-8 p-6"
    >
      <header className="flex flex-col gap-3">
        <span className={`${typeRole.meta} uppercase tracking-widest text-meta`}>Steward</span>
        <h1 className={`${typeRole.display} text-fg`}>
          {mode === "new" ? "Let's get to work." : "Welcome back."}
        </h1>
        <p className={`${typeRole.body} text-muted`}>
          {mode === "new"
            ? "Tell me your organization's name and where to reach you. That's everything I need — the reading is my job."
            : "Your address is enough. Everything is where you left it."}
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {mode === "new" ? (
          <TextField
            label="Organization name"
            name="orgName"
            autoComplete="organization"
            placeholder="River Keepers"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        ) : null}
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@yourorg.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...(error !== undefined ? { error } : {})}
        />

        {mode === "new" ? (
          <p data-consent className={`${typeRole.secondary} text-muted`}>
            {CONSENT}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={pending}
          pendingLabel={mode === "new" ? "Setting things up" : "Signing you in"}
        >
          {mode === "new" ? "Start" : "Sign in"}
        </Button>
      </form>

      {mode === "new" ? (
        // The honest absence — see NOT-YET in the module header.
        <p data-ein-note className={`${typeRole.secondary} text-meta`}>
          Have a 501(c)(3) EIN? I can't check the IRS registry yet, so I'm not going to ask for a
          number I'd only file away. It stays optional when it arrives.
        </p>
      ) : null}

      <p className={`${typeRole.secondary} text-muted`}>
        {mode === "new" ? "Already know me?" : "First time here?"}{" "}
        <Button
          type="button"
          variant="quiet"
          onClick={() => setMode(mode === "new" ? "returning" : "new")}
        >
          {mode === "new" ? "Sign in instead" : "Start a new organization"}
        </Button>
      </p>
    </main>
  );
}
