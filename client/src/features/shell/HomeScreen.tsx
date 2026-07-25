/**
 * @implements UXS-1 v1 (the home is the app; one adaptive column)
 * @implements AUTS-3 v1 (the chrome's Pause is the real kill switch, from day one)
 *
 * The DATA-BOUND home (XH-12) — what a signed-in founder actually sees, as
 * opposed to `ShellPreview`, which is the dev harness for the same shell.
 *
 * It owns exactly two things: the session-level chrome bindings (the kill
 * switch, the org identity, sign-out) and the region composition. Region
 * CONTENT arrives increment by increment — the conversation (E8), the Ready
 * spine (E9), and so on. Until a region has real content it renders nothing at
 * all rather than a placeholder: `Home` omits an empty region entirely, so the
 * founder never meets a labelled empty box pretending work is happening there.
 *
 * **The home has SHAPES, not screens** (XH-12 / DEC-18). The day-one shape is
 * the same chrome and the same four regions at a different density, chosen by
 * ONBS-6's deterministic minimum-viable-context predicate — the home stops being
 * day-one at exactly the moment Steward knows enough to write. Nothing about the
 * switch is a route, and the founder's spatial memory survives it.
 */
import { useState } from "react";
import { useAuth } from "../../api/useAuth.js";
import { useAutonomy } from "../../api/useAutonomy.js";
import { useOnboarding } from "../../api/useOnboarding.js";
import { useOrgs } from "../../api/useOrgs.js";
import { Button, Narration } from "../../ds/index.js";
import { ComposeSheet } from "../compose/ComposeSheet.js";
import { type ComposeDraft, EMPTY_COMPOSE, parkedNote } from "../compose/compose.js";
import { Conversation } from "../conversation/Conversation.js";
import { DraftOpened } from "../draft/DraftOpened.js";
import { useDayOne } from "../onboarding/DayOne.js";
import { isDayOne } from "../onboarding/dayOne.js";
import { useReady } from "../ready/ReadySpine.js";
import { Home, useSummon } from "./Home.js";

/**
 * The compose sheet in its pane. On success it SWAPS the pane to the new draft
 * (XH-13) rather than closing: the adapted per-channel variants are what
 * APRS-5 asks the founder to confirm, and they are one level down, not away.
 */
function ComposePane({
  draft,
  onChange,
}: {
  draft: ComposeDraft;
  onChange: (next: ComposeDraft) => void;
}) {
  const { summon } = useSummon();
  const parked = parkedNote(draft);
  return (
    <>
      <ComposeSheet
        draft={draft}
        onChange={onChange}
        onComposed={(itemId) => {
          onChange(EMPTY_COMPOSE);
          summon({ kind: "draft", itemId });
        }}
      />
      {parked ? (
        <p className="font-body text-sm text-meta" data-compose-parked>
          {parked}
        </p>
      ) : null}
    </>
  );
}

/** A pane target whose surface has not been built yet — said, never faked. */
function NotYetPane() {
  return (
    <Narration
      headline="I haven't built this one out yet."
      detail="It's on the way. Everything you need today is on the home behind this."
    />
  );
}

/** The pane's heading for a target that has no body yet. */
function paneTitle(target: { kind: string }): string {
  if (target.kind === "controls") return "Controls";
  if (target.kind === "compose") return "Compose";
  return "Look inside";
}

/**
 * The opened draft. A thin wrapper so the pane body can close itself after a
 * disposition — `Home` owns the open/closed state, and `SummonedSurface`'s own
 * dismissal is the founder's gesture, not the app's.
 */
function DraftOpenedPane({ itemId }: { itemId: string }) {
  const { dismiss } = useSummon();
  return <DraftOpened itemId={itemId} onClose={dismiss} />;
}

/** The signed-in home (XH-12), bound to the session. */
export function HomeScreen() {
  const { me, logout } = useAuth();
  const { active } = useOrgs();
  const { status, killSwitch, resume } = useAutonomy();
  const { ready } = useOnboarding();

  // Until the status query answers, treat publishing as RUNNING: showing
  // "paused" while we don't know would tell a founder their publishing is
  // stopped when it is not — the more dangerous of the two wrong answers.
  const paused = status.data === true;
  const orgName = active.data?.name;
  const email = me.data?.user.email;

  // The composer's unsent draft lives HERE, above the pane, so closing the
  // sheet parks it instead of destroying it (XH-14). In memory only — the note
  // the sheet shows says exactly that rather than promising it is saved.
  const [composeDraft, setComposeDraft] = useState<ComposeDraft>(EMPTY_COMPOSE);

  const dayOne = useDayOne({ email, orgName });
  const spine = useReady();
  const inDayOne = isDayOne(ready.data);

  const signOut = (
    <Button variant="quiet" onClick={() => logout.mutate()} data-signout>
      Sign out
    </Button>
  );

  return (
    <Home
      paused={paused}
      onPause={() => killSwitch.mutate()}
      onResume={() => resume.mutate({})}
      // PINNED is shape-independent. A GR-3 hold pins whether the org is on day
      // one or its fortieth week — the whole point is that it cannot be missed.
      pinned={spine.pinned}
      // Day one puts arrival and the review where Ready will be; once Steward
      // knows enough to write, the same region becomes the disposition spine.
      ready={inDayOne ? dayOne.ready : spine.ready}
      // The conversation is present in EVERY shape (UXS-2) — the home's medium,
      // not a day-one affordance the founder loses once onboarding is done.
      conversation={<Conversation />}
      // XH-13 — the only pane body wired so far. The glass-wall views, Controls
      // and Compose land with their own increments; until then their targets
      // fall through to an honest note rather than an empty pane.
      renderPane={(target) => {
        if (target.kind === "draft") {
          return { title: "The draft, opened", body: <DraftOpenedPane itemId={target.itemId} /> };
        }
        if (target.kind === "compose") {
          return {
            title: "Make something",
            body: <ComposePane draft={composeDraft} onChange={setComposeDraft} />,
          };
        }
        return { title: paneTitle(target), body: <NotYetPane /> };
      }}
      terminus={
        <>
          {inDayOne ? dayOne.terminus : spine.terminus}
          {signOut}
        </>
      }
    />
  );
}
