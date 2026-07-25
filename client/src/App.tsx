/**
 * @implements ACCS-1 v1 (session gating: no org surface without a signed-in User)
 *
 * The app's root, and the ONLY place that branches on the session (ACCS-1: a
 * User with no membership can act in no org). There are exactly two founder
 * destinations and nothing between them:
 *
 *   signed out → the doorstep (XO-6)
 *   signed in  → the home (XH-12)
 *
 * That is the whole "routing" story, and it is deliberate: DEC-18 abolished the
 * six-surface shell, so summoned views are client-local view state inside the
 * home, never destinations. Adding a router here is how that decision quietly
 * gets undone.
 *
 * The two dev-only harnesses (`#ds`, `#shell`) mount ahead of the branch because
 * they render no org data and need no session; `import.meta.env.DEV` strips them
 * from a production build.
 */
import { useAuth } from "./api/useAuth";
import { Gallery } from "./ds/Gallery";
import { Narration } from "./ds/index.js";
import { Doorstep } from "./features/doorstep/Doorstep";
import { HomeScreen } from "./features/shell/HomeScreen";
import { ShellPreview } from "./features/shell/ShellPreview";

/**
 * A failed sign-in in plain language. tRPC surfaces transport and validation
 * failures alike; the founder needs to know which of the two it was, not the
 * code — "invalid_string" on a doorstep is a dead end (VAL-6).
 */
function signInError(error: { message: string } | null): string | undefined {
  if (!error) return undefined;
  return /email/i.test(error.message)
    ? "That doesn't look like an email address I can reach you at."
    : "I couldn't get you in just now. Try again in a moment.";
}

export function App() {
  const { me, signIn } = useAuth();

  // The dev-only design-system gallery (#ds). Not a founder surface and not a
  // screen — it renders the DSS contracts so browser checks and the e2e suite
  // can assert them directly. Stripped from a production build.
  if (import.meta.env.DEV && window.location.hash === "#ds") return <Gallery />;
  // The One-Home shell with STATIC regions (#shell) — the XH-12 invariants and
  // DSS-24 summon mechanics, assertable without a backend or a session.
  if (import.meta.env.DEV && window.location.hash === "#shell") return <ShellPreview />;

  if (me.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[var(--home-measure)] items-center p-6">
        <Narration headline="One moment — finding your desk." live />
      </main>
    );
  }

  if (!me.data) {
    return (
      <Doorstep
        onSubmit={(input) => signIn.mutate(input)}
        pending={signIn.isPending}
        error={signInError(signIn.error)}
      />
    );
  }

  return <HomeScreen />;
}
