/**
 * The in-app design-system gallery — the running parallel of the `@dsCard`
 * preview kit (`design/design-system/steward/preview/*.html`).
 *
 * NOT a founder surface and NOT a screen: it renders no org data, has no
 * experience element, and is mounted only under `import.meta.env.DEV`. Its job
 * is to make every DSS contract renderable in the real app so an agent's
 * browser check and the E5 e2e suite can assert the contracts directly rather
 * than inferring them from a screen that happens to use a component.
 *
 * Each section is labelled with its contract ID so a failure names its spec.
 */
import { useState } from "react";
import {
  ArticleLinkBadge,
  FitBadge,
  FitReason,
  KillSwitchRow,
  TrustLevelIndicator,
} from "./Badges.js";
import { Button } from "./Button.js";
import { Card, PhotoSlot } from "./Card.js";
import { ChatMessage, InlineWorkCard } from "./ChatMessage.js";
import { AwaitingPicture, CitationBlock, OptionalReason } from "./Disposition.js";
import { TextArea, TextField, Toggle } from "./Field.js";
import { HeldForApprovalCard, VetoWindowCard } from "./HoldCards.js";
import { CaughtUp, Narration } from "./Narration.js";
import { ApprovePanel, PostCard } from "./PostCard.js";
import { AssumedNote, ProvenanceLine, ReasonLine } from "./TrustMarks.js";
import { typeRole } from "./type.js";

const noop = () => undefined;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section data-ds-section={id} className="flex flex-col gap-4 border-t border-border pt-6">
      <h2 className={`${typeRole.subsection} text-fg`}>
        {id} — {title}
      </h2>
      {children}
    </section>
  );
}

/** Renders every landed DSS contract. Dev-only (see module header). */
export function Gallery() {
  const [x, setX] = useState(true);
  return (
    <main className="mx-auto flex max-w-[var(--home-measure)] flex-col gap-8 bg-bg p-6">
      <h1 className={`${typeRole.display} text-fg`}>Steward design system</h1>

      <Section id="DSS-5" title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Approve</Button>
          <Button variant="primary" disabled>
            Approve
          </Button>
          <Button variant="primary" loading pendingLabel="Approving…">
            Approve
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary">Edit</Button>
          <Button variant="quiet">Skip</Button>
          <Button variant="danger">Pause everything</Button>
        </div>
      </Section>

      <Section id="DSS-6" title="Input & form controls">
        <TextField placeholder="Your organization's name" />
        <TextField
          defaultValue="not-an-email"
          error="That doesn't look like an email — one more try?"
        />
        <TextArea
          placeholder="Tell me anything — “less formal”, “never name donors”…"
          helpText="Redirects become permanent rules — I'll confirm what I understood before saving."
        />
        <Toggle checked={x} onChange={setX} label="Facebook" />
        <Toggle
          checked={false}
          onChange={() => undefined}
          label="X"
          reason="skipped: over policy “no long stories on X”"
        />
      </Section>

      <Section id="DSS-7" title="Card / surface & photo slot">
        <Card>
          <PhotoSlot emptyLabel="No photo yet — I'll ask for one" />
          <p className="font-body text-base text-fg">
            The well in Kamuli is running. Three months ago you helped us break ground.
          </p>
        </Card>
        <Card elevation="raised">
          <p className="font-body text-sm text-muted">
            Raised — the summoned pane and approve panel.
          </p>
        </Card>
      </Section>

      <Section id="DSS-8/11/13" title="Trust marks — reason, assumed, provenance">
        <ReasonLine>
          Your beach cleanup is Saturday — donors respond best to before/after pairs, so I&apos;d
          love 3 photos.
        </ReasonLine>
        <AssumedNote onCorrect={noop}>
          Your service area is Travis County — I read it off your website.
        </AssumedNote>
        <ProvenanceLine
          sources={[
            { label: "your update last Tuesday", onOpen: noop },
            { label: "your website", onOpen: noop },
          ]}
        />
        <ProvenanceLine sources={[{ label: "the County Wildlife Report" }]} external />
      </Section>

      <Section id="DSS-9/18" title="FitBadge & ArticleLink">
        <div className="flex flex-wrap items-center gap-2">
          <FitBadge platform="facebook_page" verdict="fit" />
          <FitBadge platform="instagram" verdict="fit" />
          <FitBadge platform="threads" verdict="fit" />
          <FitBadge platform="x" verdict="skipped" />
        </div>
        <FitReason platform="x" reason="over policy “no long stories on X”" onOverride={noop} />
        <div className="flex flex-wrap items-center gap-2">
          <FitBadge platform="facebook_page" verdict="fit" />
          <ArticleLinkBadge platform="x" />
          <ArticleLinkBadge platform="threads" />
        </div>
      </Section>

      <Section id="DSS-10" title="TrustLevel & the kill switch">
        <TrustLevelIndicator current="TL0" onSelect={noop} />
        <KillSwitchRow onPause={noop} />
      </Section>

      <Section id="DSS-12" title="Awaiting picture">
        <AwaitingPicture onChooseFromLibrary={noop} />
      </Section>

      <Section id="DSS-14" title="OptionalReason">
        <OptionalReason action="Skipped." onChoose={noop} onTellMore={noop} />
      </Section>

      <Section id="DSS-15/16" title="Veto-window vs HeldForApproval">
        <VetoWindowCard
          until="Thu 6:00 pm"
          destinations="Facebook and Instagram"
          reason="You've approved 10 of these unedited, so I published on your behalf. Undo any time in the window."
          onVeto={noop}
          onSeeWhatWentOut={noop}
        >
          Volunteer spotlight: Maria&apos;s 200th shift
        </VetoWindowCard>
        <HeldForApprovalCard
          reason="This touches a sensitive topic, so I'm not publishing it myself — it's yours to approve, whatever your trust settings."
          onApprove={noop}
          onEdit={noop}
          onRedirect={noop}
        >
          A note on the flooding at the county shelter — how we&apos;re helping the animals
          displaced this week, and how neighbors can pitch in.
        </HeldForApprovalCard>
      </Section>

      <Section id="DSS-17" title="CitationBlock">
        <p className="font-body text-base text-fg">
          Wetlands like ours filter a city&apos;s water for free — and our county just lost 12% of
          them in a decade.
        </p>
        <CitationBlock
          source="County Wildlife Report, March 2026"
          url="https://conservation.example.org/report"
        />
      </Section>

      <Section id="DSS-19" title="Ready-spine post card">
        <PostCard
          contentType="caseStudy"
          body="The well in Kamuli is running. Three months ago you helped us break ground — this week, 400 families drew clean water for the first time."
          reason="Your donors were promised a progress report when drilling started — this closes that loop."
          variants={[
            { platform: "facebook_page", verdict: "fit" },
            { platform: "instagram", verdict: "fit" },
            { platform: "x", verdict: "skipped", fitReason: "over policy “no long stories on X”" },
          ]}
          onApprove={noop}
          onEdit={noop}
          onSkip={noop}
          onRedirect={noop}
          onOverrideFit={noop}
          footer={
            <ProvenanceLine sources={[{ label: "your update last Tuesday", onOpen: noop }]} />
          }
        />
        <PostCard
          contentType="mission"
          body="Written and ready — it just needs a photo."
          awaitingPicture
          variants={[{ platform: "facebook_page", verdict: "fit" }]}
          onApprove={noop}
          onChoosePhoto={noop}
        />
      </Section>

      <Section id="DSS-20" title="Approve panel">
        <ApprovePanel
          rows={[
            { platform: "facebook_page", when: "Tue 9:05 am" },
            { platform: "instagram", when: "Tue 12:30 pm" },
            { platform: "x", skipped: true },
          ]}
          onApprove={noop}
          onOverride={noop}
          reason="I picked the times your followers are usually around. Change anything — or just tell me."
        />
      </Section>

      <Section id="DSS-21" title="Chat message">
        <div className="flex flex-col gap-4">
          <ChatMessage author="steward">
            You mentioned the first family you helped — what happened to them?
          </ChatMessage>
          <ChatMessage author="founder">
            They still visit every month! The kids volunteer at our events now.
          </ChatMessage>
          <ChatMessage
            author="steward"
            attachment={
              <InlineWorkCard
                title="Full circle: the family that started it all"
                note="draft · impact story · arriving in Tuesday's digest"
              />
            }
          >
            That's wonderful — a perfect full-circle story. I'll draft it as next week's impact
            post.
          </ChatMessage>
        </div>
      </Section>

      <Section id="DSS-22" title="Narration & caught-up">
        <Narration
          live
          headline="I'm reading your website now."
          detail="First drafts in about ten minutes. Want to chat while we wait? I have a few questions only you can answer."
          action={<Button variant="secondary">Sure, let's talk</Button>}
        />
        <CaughtUp
          weeks={6}
          summary="That's everything for this week — 5 posts heading out. See you next Tuesday."
          nextUp="Next up from me: photos for Saturday's cleanup, and your GivingTuesday plan."
        />
      </Section>
    </main>
  );
}
