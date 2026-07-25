/**
 * @implements UXS-6 v1  (the controls surface — kill switch, pause, trust, channels)
 * @implements AUTS-3 v1 (the kill switch mirror; per-channel pause)
 * @implements ONBS-4 v1 (channel connect and re-auth, any order, never a gate)
 *
 * **Screen XA-6 — the Controls tray**, summoned from the chrome.
 *
 * Pixels: `design/mockups/exp-42-45-46-47-founder-surfaces/round-1/`.
 *
 * **The kill switch here is a MIRROR, not the control.** AUT-3 is P0
 * `flexibility: hard` — one gesture from the chrome at every trust level — so
 * the real switch is the chrome's Pause and this is a second way to reach the
 * same state. UXS-6 says so explicitly: "not buried in settings". If this tray
 * were ever the only way to stop publishing, the guardrail would be broken no
 * matter how good this screen looked.
 *
 * **NOT-YET, stated rather than faked.** Digest cadence (APRS-2), notifications
 * (APRS-4) and plan & billing (BIL-1) belong on this screen per UXS-6, and none
 * of them has a backend: no procedure, no data, nothing to set. Rendering
 * dropdowns that forget what you chose is worse than absence, so each is named
 * with what it is waiting for (the same rule as the doorstep's EIN field). The
 * NWS-6 news subdomain and the XB-3 cancel section ride with `@news` and
 * billing, both out of this phase.
 */
import { channelPlatforms } from "@shared";
import { useAutonomy } from "../../api/useAutonomy.js";
import { useChannels } from "../../api/useChannels.js";
import { Button, Card, KillSwitchRow, Narration, ReasonLine, typeRole } from "../../ds/index.js";
import { type ChannelStatus, presentChannel, TRUST_LEVELS } from "./controls.js";

/** Founder-facing channel names, off the @shared enum. */
const CHANNEL_LABELS: Record<string, string> = {
  facebook_page: "Facebook",
  instagram: "Instagram",
  threads: "Threads",
  x: "X",
};

/** The Controls tray (XA-6). */
export function ControlsTray() {
  const { status, killSwitch, resume } = useAutonomy();
  const { connections, connect, reconnect } = useChannels();

  const paused = status.data === true;
  const byPlatform = new Map((connections.data ?? []).map((c) => [c.platform, c]));

  return (
    <div className="flex flex-col gap-4" data-controls>
      {/* The kill switch, mirrored. The chrome's Pause is the real one. */}
      <Card asArticle={false} data-kill-switch>
        <KillSwitchRow
          paused={paused}
          onPause={() => killSwitch.mutate()}
          onResume={() => resume.mutate({})}
        />
        <ReasonLine>
          This is the same switch as Pause up in the bar — it's always up there, whatever else is on
          screen.
        </ReasonLine>
      </Card>

      {/* CHANNELS — connect in any order, at any time, never a gate (ONBS-4). */}
      <Card asArticle={false} data-channels>
        <p className={`${typeRole.meta} uppercase tracking-widest text-meta`}>Where I can post</p>
        <ul className="flex flex-col gap-3">
          {channelPlatforms.map((platform) => {
            const row = byPlatform.get(platform);
            const view = presentChannel({
              platform,
              status: (row?.status ?? null) as ChannelStatus | null,
              statusReason: row?.statusReason ?? "",
            });
            return (
              <li key={platform} className="flex flex-col gap-1" data-channel={platform}>
                <span className={`${typeRole.secondary} font-semibold text-fg`}>
                  {CHANNEL_LABELS[platform] ?? platform}
                </span>
                <span className={`${typeRole.secondary} text-muted`} data-channel-summary>
                  {view.summary}
                </span>
                {view.action === "connect" ? (
                  <div>
                    <Button
                      variant="secondary"
                      onClick={() => connect.mutate({ platform })}
                      loading={connect.isPending}
                      data-connect={platform}
                    >
                      Connect {CHANNEL_LABELS[platform] ?? platform}
                    </Button>
                  </div>
                ) : null}
                {view.action === "reconnect" ? (
                  <div>
                    <Button
                      variant="secondary"
                      onClick={() => reconnect.mutate({ platform })}
                      loading={reconnect.isPending}
                      data-reconnect={platform}
                    >
                      Reconnect
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <ReasonLine>
          Connect these in any order, whenever suits — I'll keep writing either way.
        </ReasonLine>
      </Card>

      {/* TRUST — the dials, with the launch state stated honestly. */}
      <Card asArticle={false} data-trust>
        <p className={`${typeRole.meta} uppercase tracking-widest text-meta`}>How much I decide</p>
        <ul className="flex flex-col gap-2">
          {TRUST_LEVELS.map((level) => (
            <li key={level.id} className="flex flex-col gap-0.5" data-trust-level={level.id}>
              <span className={`${typeRole.secondary} font-semibold text-fg`}>{level.label}</span>
              <span className={`${typeRole.secondary} text-muted`}>{level.detail}</span>
            </li>
          ))}
        </ul>
        {/* AUTS-1: only TL0 is ACTIVE at launch. Offering a dial that silently
            refuses to move is the fake control this whole file avoids. */}
        <ReasonLine>
          Right now I'm on the first one for everything — I approve nothing on my own. Earning the
          others comes later, and fundraising asks and outside news stay with you permanently.
        </ReasonLine>
      </Card>

      {/* NOT-YET — named, with what each is waiting for. */}
      <div data-not-yet>
        <Narration
          headline="Not here yet"
          detail={
            <ul className="flex list-disc flex-col gap-1 pl-4">
              <li>How often I check in with a digest — I don't have a schedule to keep yet.</li>
              <li>Where to reach you outside the app — no email or messaging set up.</li>
              <li>
                Your plan and billing — nothing to bill while you're helping me get this right.
              </li>
            </ul>
          }
        />
      </div>
    </div>
  );
}
