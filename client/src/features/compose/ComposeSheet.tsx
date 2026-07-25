/**
 * @implements UXS-7 v1  (Compose is an ACTION, never a place)
 * @implements APRS-5 v1 (the founder-authored master → the same engine chain)
 *
 * **Screen XH-14 — the compose sheet**, rendered into the DSS-24 summoned pane
 * and reached from `+ Compose` in the chrome (`XH-3` / `XH-11`). It is never a
 * destination: there is no nav item, no route, and closing it returns the
 * founder exactly where they were.
 *
 * Pixels: `design/mockups/exp-42-45-46-47-founder-surfaces/round-1/`.
 *
 * **The sheet gathers; it does not publish.** APRS-5 is explicit that a composed
 * master is an alternate ENTRY to the content engine's adapt → VAL → fit chain,
 * not a side channel: authorship is not a bypass, so what lands is a DRAFT in
 * Ready that still has to be confirmed. On success this opens that draft
 * (XH-13) so the adapted per-channel variants are the very next thing seen —
 * which is what "adapted variants to confirm" means once the engine, not the
 * sheet, is the thing doing the adapting.
 *
 * **Library first** (GENS-3): the org's own photographs lead, upload is the
 * fallback. A founder with two minutes should not have to go find a file.
 *
 * **No picture is not a refusal.** GENS-3's invariant blocks APPROVAL, not
 * writing — a pictureless post is a legitimate `awaiting_picture` draft, so the
 * sheet accepts it and states the consequence instead of holding the words
 * hostage.
 */
import type { ChannelPlatform } from "@shared";
import { channelPlatforms } from "@shared";
import { useState } from "react";
import { useApproval } from "../../api/useApproval.js";
import { useMedia } from "../../api/useMedia.js";
import {
  Button,
  Narration,
  ReasonLine,
  TextArea,
  TextField,
  Toggle,
  typeRole,
} from "../../ds/index.js";
import { type ComposeDraft, canCompose, whatIsMissing } from "./compose.js";

/**
 * The launch channels a founder can target, off the @shared enum — never a
 * re-declared string union (the constitution's cross-boundary rule).
 */
const CHANNEL_LABELS: Record<ChannelPlatform, string> = {
  facebook_page: "Facebook",
  instagram: "Instagram",
  threads: "Threads",
  x: "X",
};

export interface ComposeSheetProps {
  draft: ComposeDraft;
  onChange: (next: ComposeDraft) => void;
  /** Called with the new draft's id once the engine has produced it. */
  onComposed: (itemId: string) => void;
}

/** The compose sheet (XH-14). */
export function ComposeSheet({ draft, onChange, onComposed }: ComposeSheetProps) {
  const { library, upload } = useMedia();
  const { compose } = useApproval();
  const [composeError, setComposeError] = useState<string | null>(null);

  const photos = library.data ?? [];
  const missing = whatIsMissing(draft);
  const ready = canCompose(draft);

  const submit = () => {
    setComposeError(null);
    compose.mutate(
      {
        title: draft.title.trim(),
        body: draft.body.trim(),
        ...(draft.mediaAssetId ? { mediaAssetId: draft.mediaAssetId } : {}),
        ...(draft.channels.length > 0 ? { channels: [...draft.channels] } : {}),
      },
      {
        onSuccess: (item) => onComposed(item.id),
        onError: () =>
          setComposeError("I couldn't get that through just now. Your words are still here."),
      },
    );
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) submit();
      }}
    >
      <TextField
        label="What's it about?"
        value={draft.title}
        onChange={(e) => onChange({ ...draft, title: e.target.value })}
        placeholder="Saturday's volunteers"
        data-compose-title
      />
      <TextArea
        label="What do you want to say?"
        rows={6}
        value={draft.body}
        onChange={(e) => onChange({ ...draft, body: e.target.value })}
        placeholder="Write it however you'd say it out loud — I'll fit it to each channel."
        data-compose-body
      />

      {/* PICTURE — library first (GENS-3), upload as the fallback. */}
      <div className="flex flex-col gap-2" data-compose-picture>
        <p className={`${typeRole.meta} uppercase tracking-widest text-meta`}>A picture</p>
        {photos.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {photos.map((p) => {
              const chosen = draft.mediaAssetId === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onChange({ ...draft, mediaAssetId: chosen ? null : p.id })}
                    aria-pressed={chosen}
                    data-library-photo={p.id}
                    className={`min-h-[44px] cursor-pointer overflow-hidden rounded-sm border-2 outline-none focus-visible:shadow-[var(--focus-ring)] ${
                      chosen ? "border-fg" : "border-border"
                    }`}
                  >
                    <img src={p.url} alt="" className="h-16 w-20 object-cover" loading="lazy" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <ReasonLine>
            Your library is empty so far — I fill it from your site and your uploads.
          </ReasonLine>
        )}
        <div>
          <label className={`${typeRole.secondary} cursor-pointer text-muted`}>
            <span className="underline decoration-dotted underline-offset-2">
              Upload one instead
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              data-compose-upload
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const bytes = new Uint8Array(await file.arrayBuffer());
                let binary = "";
                for (const b of bytes) binary += String.fromCharCode(b);
                upload.mutate(
                  { contentBase64: btoa(binary), contentType: file.type || "image/jpeg" },
                  { onSuccess: (asset) => onChange({ ...draft, mediaAssetId: asset.id }) },
                );
              }}
            />
          </label>
        </div>
      </div>

      {/* CHANNELS — optional. Leaving them empty hands the choice to the fit gate. */}
      <div className="flex flex-col gap-1" data-compose-channels>
        <p className={`${typeRole.meta} uppercase tracking-widest text-meta`}>Where it goes</p>
        {channelPlatforms.map((p) => (
          <Toggle
            key={p}
            label={CHANNEL_LABELS[p]}
            checked={draft.channels.includes(p)}
            onChange={(on) =>
              onChange({
                ...draft,
                channels: on ? [...draft.channels, p] : draft.channels.filter((x) => x !== p),
              })
            }
          />
        ))}
        <ReasonLine>
          Leave these alone and I'll pick the ones it fits, and tell you which it doesn't.
        </ReasonLine>
      </div>

      {missing.length > 0 ? (
        <div data-compose-missing>
          <Narration
            headline="Still to come"
            detail={
              <ul className="flex list-disc flex-col gap-1 pl-4">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            }
          />
        </div>
      ) : null}

      {composeError ? <ReasonLine>{composeError}</ReasonLine> : null}

      <ReasonLine>
        Nothing goes out from here. I'll write the per-channel versions and put it in Ready for you
        to confirm — the same check every draft of mine gets.
      </ReasonLine>

      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!ready}
          loading={compose.isPending}
          pendingLabel="Writing the channel versions"
          data-compose-submit
        >
          Hand it to me
        </Button>
      </div>
    </form>
  );
}
