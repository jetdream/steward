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
import { useAuth } from "../../api/useAuth.js";
import { useAutonomy } from "../../api/useAutonomy.js";
import { useOnboarding } from "../../api/useOnboarding.js";
import { useOrgs } from "../../api/useOrgs.js";
import { Button, Narration } from "../../ds/index.js";
import { useDayOne } from "../onboarding/DayOne.js";
import { isDayOne } from "../onboarding/dayOne.js";
import { Home } from "./Home.js";

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

  const dayOne = useDayOne({ email, orgName });
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
      ready={inDayOne ? dayOne.ready : undefined}
      conversation={
        inDayOne ? (
          dayOne.conversation
        ) : (
          <Narration
            headline={orgName ? `${orgName} is set up.` : "You're signed in."}
            detail="I know enough to start writing. Your drafts land above as they're ready — nothing publishes without your yes."
            action={signOut}
          />
        )
      }
      terminus={
        inDayOne ? (
          <>
            {dayOne.terminus}
            {signOut}
          </>
        ) : undefined
      }
    />
  );
}
