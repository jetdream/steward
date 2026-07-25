/**
 * A dev-only harness that mounts the real `Home` shell with static region
 * content, so the XH-12 invariants and the DSS-24 summon mechanics can be
 * exercised in a browser before any data is wired.
 *
 * NOT a founder surface: it renders no org data and has no experience element.
 * It mounts under `import.meta.env.DEV` at `#shell`, exactly like the DS gallery
 * — and for the same reason: the assertions that matter here (focus returned,
 * the stream inert, the pinned zone NOT inert, the pane out of the top layer)
 * are rendered-state facts that no unit test can see.
 *
 * E6+ replace the static content with the real regions.
 */

import { useState } from "react";
import { Card, CaughtUp, ChatMessage, HeldForApprovalCard, Narration } from "../../ds/index.js";
import { LOOK_INSIDE } from "./Chrome.js";
import { Home } from "./Home.js";

const noop = () => undefined;

/** Mounts the real shell with placeholder regions (dev-only). */
export function ShellPreview() {
  const [paused, setPaused] = useState(false);
  return (
    <Home
      paused={paused}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
      pinned={
        <HeldForApprovalCard
          reason="This touches a sensitive topic, so I'm not publishing it myself — it's yours to approve, whatever your trust settings."
          onApprove={noop}
          onEdit={noop}
        >
          A note on the flooding at the county shelter.
        </HeldForApprovalCard>
      }
      ready={
        <Card>
          <p className="font-body text-base text-fg">Ready for you · 2 of 4 · about five minutes</p>
        </Card>
      }
      conversation={
        <ChatMessage author="steward">
          Anything you want to say about this week? I have a few questions only you can answer.
        </ChatMessage>
      }
      terminus={
        <CaughtUp
          weeks={6}
          summary="That's everything for this week — 5 posts heading out."
          nextUp="Next up from me: photos for Saturday's cleanup."
        />
      }
      renderPane={(target) => ({
        title:
          target.kind === "view"
            ? (LOOK_INSIDE.find((v) => v.id === target.view)?.label ?? target.view)
            : target.kind === "controls"
              ? "Controls"
              : target.kind === "compose"
                ? "Compose"
                : "The draft, opened",
        body: (
          <Narration
            headline="This pane is the DSS-24 summoned surface."
            detail="The stream beside it is inert and dimmed; the pinned zone above stays live, focusable and announcing. Escape or “Back to Steward” returns focus to the control that opened it."
          />
        ),
      })}
    />
  );
}
