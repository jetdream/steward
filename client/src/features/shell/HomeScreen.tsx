/**
 * @implements UXS-1 v1 (the home is the app; one adaptive column)
 * @implements AUTS-3 v1 (the chrome's Pause is the real kill switch, from day one)
 *
 * The DATA-BOUND home (XH-12) — what a signed-in founder actually sees, as
 * opposed to `ShellPreview`, which is the dev harness for the same shell.
 *
 * It owns exactly two things: the session-level chrome bindings (the kill
 * switch, the org identity, sign-out) and the region composition. Region
 * CONTENT arrives increment by increment — day-one narration and the interview
 * (E7), the conversation (E8), the Ready spine (E9), and so on. Until a region
 * has real content it renders nothing at all rather than a placeholder: `Home`
 * omits an empty region entirely, so the founder never meets a labelled empty
 * box pretending work is happening there.
 *
 * The greeting is the one thing shown today, and it is deliberately narrow in
 * what it claims. It says the home is ready and names the org; it does NOT say
 * "I'm reading your website now", because at this increment nothing is reading
 * anything. Narrating work that is not running is the fake state VAL-6 forbids
 * — the same rule that keeps the EIN field off the doorstep.
 */
import { useAuth } from "../../api/useAuth.js";
import { useAutonomy } from "../../api/useAutonomy.js";
import { useOrgs } from "../../api/useOrgs.js";
import { Button, Narration } from "../../ds/index.js";
import { Home } from "./Home.js";

/** The signed-in home (XH-12), bound to the session. */
export function HomeScreen() {
  const { logout } = useAuth();
  const { active } = useOrgs();
  const { status, killSwitch, resume } = useAutonomy();

  // Until the status query answers, treat publishing as RUNNING: showing
  // "paused" while we don't know would tell a founder their publishing is
  // stopped when it is not — the more dangerous of the two wrong answers.
  const paused = status.data === true;
  const orgName = active.data?.name;

  return (
    <Home
      paused={paused}
      onPause={() => killSwitch.mutate()}
      onResume={() => resume.mutate({})}
      conversation={
        <Narration
          headline={orgName ? `${orgName} is set up.` : "You're signed in."}
          detail="This home is where everything lands — what needs you, what's ready to approve, and our conversation. It fills in as I get to know your organization."
          action={
            <Button variant="quiet" onClick={() => logout.mutate()} data-signout>
              Sign out
            </Button>
          }
        />
      }
    />
  );
}
