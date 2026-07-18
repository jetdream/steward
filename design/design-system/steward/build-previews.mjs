// Preview-kit generator — stamps self-contained @dsCard preview HTML files
// into preview/ from the card templates below, inlining tokens.css so every
// card renders standalone in the Claude Design "Design System" pane
// (uploaded via /design-sync). Single source: edit tokens.css or a template
// here, re-run `node build-previews.mjs`, never edit preview/*.html by hand.
// @implements DS-1 (cards resolve every value via the inlined token schema)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tokensCss = readFileSync(join(here, 'tokens.css'), 'utf8');
const root = tokensCss.slice(tokensCss.indexOf(':root'));

// Base styles shared by every card. Values resolve from tokens only (DS-1).
const BASE = `
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg);
  font-family: var(--font-body); font-weight: 500;
  font-size: var(--text-base); line-height: var(--leading-body); }
main { padding: var(--space-6); }
h1 { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600;
  margin: 0 0 var(--space-4); line-height: var(--leading-tight);
  letter-spacing: var(--tracking-display); }
h2 { font-size: var(--text-sm); font-weight: 600; color: var(--muted);
  margin: var(--space-6) 0 var(--space-3); }
/* Display face for headlines, card titles, and the streak numerals; body
 * stays Source Sans. (DS-3 v2 — chiseled display over magazine body.) */
.display { font-family: var(--font-display); letter-spacing: var(--tracking-display); }
.note { color: var(--muted); font-size: var(--text-sm); }
.row { display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap; }
.stack { display: flex; flex-direction: column; gap: var(--space-3); }

.btn { display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-2); font: inherit; font-weight: 500; border: none;
  cursor: pointer; background: none;
  transition: background var(--motion-fast) var(--ease-standard),
              transform var(--motion-fast) var(--ease-standard); }
.btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.btn-primary { background: var(--accent); color: var(--accent-on);
  padding: 14px 24px; border-radius: var(--radius-sm); }
.btn-primary:hover { background: var(--accent-hover); }
.btn-primary:active { background: var(--accent-active); transform: scale(0.96); }
.btn-secondary { background: var(--surface); color: var(--fg);
  border: 1px solid var(--border); padding: 10px 16px;
  border-radius: var(--radius-pill); font-size: var(--text-sm); }
.btn-quiet { color: var(--muted); padding: 10px 12px; font-size: var(--text-sm);
  border-radius: var(--radius-sm); }
.btn-quiet:hover { color: var(--fg); background: var(--surface-warm); }
.btn-danger { background: var(--surface); color: var(--danger);
  border: 1px solid var(--danger); padding: 10px 16px;
  border-radius: var(--radius-sm); font-size: var(--text-sm); }
.btn[disabled] { background: var(--surface-warm); color: var(--meta); cursor: default; }

.reason { display: flex; gap: var(--space-2); color: var(--muted);
  font-size: var(--text-sm); align-items: baseline; }
.reason::before { content: "\\21B3"; color: var(--meta); }

.fit { display: inline-flex; gap: 6px; align-items: center;
  font-size: var(--text-xs); font-weight: 600; padding: 4px 10px;
  border-radius: var(--radius-pill); border: 1px solid var(--border);
  color: var(--fg-2); background: var(--surface); }
.fit.ok { color: var(--success);
  border-color: color-mix(in srgb, var(--success) 35%, var(--border));
  background: color-mix(in srgb, var(--success) 6%, var(--surface)); }
.fit.skip { color: var(--muted); background: var(--surface-warm);
  text-decoration: line-through; }

.assumed { display: inline-flex; gap: var(--space-2); align-items: baseline;
  font-size: var(--text-sm); padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--warn) 30%, var(--border));
  background: color-mix(in srgb, var(--warn) 6%, var(--surface)); }
.assumed .tag { font-size: var(--text-xs); font-weight: 600; color: var(--warn);
  text-transform: lowercase; }
.assumed a { color: var(--fg); }

.avatar { width: 36px; height: 36px; border-radius: var(--radius-pill);
  background: var(--fg); color: var(--bg); display: inline-flex;
  align-items: center; justify-content: center; font-weight: 600;
  font-size: var(--text-sm); flex: none; }

.card { background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); }
`;

// 4:3 photo stand-in (represents a real org photo per VAL-4 — content, not UI
// chrome, so its fill colors are not tokens).
const PHOTO = `<svg viewBox="0 0 400 300" role="img" aria-label="Org photo placeholder" style="display:block;width:100%;height:auto;border-radius:var(--radius-md)"><rect width="400" height="300" fill="#e7e0d8"/><circle cx="318" cy="72" r="34" fill="#f3ede4"/><path d="M0 232 L96 150 L184 218 L268 138 L400 240 L400 300 L0 300 Z" fill="#d5cabb"/><path d="M0 262 L130 196 L242 258 L340 206 L400 244 L400 300 L0 300 Z" fill="#c4b6a3"/></svg>`;

const cards = [
  {
    file: 'colors.html', group: 'Foundations', name: 'Colors',
    subtitle: 'Token roles — single terracotta accent', width: 800,
    implements: 'DS-1 DS-2 DS-4 DS-7',
    css: `.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--space-4); }
.swatch { border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.chip { height: 72px; background: var(--v); }
.meta { padding: var(--space-3); font-size: var(--text-xs); color: var(--muted); }
.meta strong { display: block; color: var(--fg); font-size: var(--text-sm); margin-bottom: 2px; }`,
    body: `<h1>Color roles</h1>
<section class="grid">
${[['Background', '--bg'], ['Surface', '--surface'], ['Surface warm', '--surface-warm'],
   ['Ink', '--fg'], ['Ink 2', '--fg-2'], ['Muted', '--muted'], ['Meta', '--meta'],
   ['Border', '--border'], ['Border soft', '--border-soft'],
   ['Accent — terracotta', '--accent'], ['Accent hover', '--accent-hover'], ['Accent active', '--accent-active'],
   ['Success', '--success'], ['Warn', '--warn'], ['Danger', '--danger']]
  .map(([n, v]) => `  <article class="swatch"><div class="chip" style="--v: var(${v})"></div><div class="meta"><strong>${n}</strong>${v}</div></article>`).join('\n')}
</section>
<p class="note" style="margin-top: var(--space-4)">One accent per screen: the primary action and the active-nav marker. Accent on white passes AA at 5.06:1 (DS-4). Light theme only in v1 (DS-7).</p>`,
  },
  {
    file: 'typography.html', group: 'Foundations', name: 'Typography',
    subtitle: 'Bricolage Grotesque display · Source Sans 3 body', width: 760,
    implements: 'DS-3',
    css: `.spec { color: var(--meta); font-size: var(--text-xs); font-weight: 500; margin: var(--space-4) 0 2px; }
.d { font-family: var(--font-display); line-height: var(--leading-tight); letter-spacing: var(--tracking-display); }`,
    body: `<h1>Type scale</h1>
<p class="spec">28px · 700 · display</p><div class="d" style="font-size: var(--text-2xl); font-weight: 700">Your week is ready</div>
<p class="spec">22px · 600 · subsection</p><div class="d" style="font-size: var(--text-xl); font-weight: 600">What I know about your programs</div>
<p class="spec">20px · 600 · card title</p><div class="d" style="font-size: var(--text-lg); font-weight: 600">Saturday's cleanup, in photos</div>
<p class="spec">16px · 500 · body (Source Sans 3)</p><div>Body runs Source Sans 3 at weight 500 — a quietly confident texture at magazine leading, calm against Bricolage's characterful headlines.</div>
<p class="spec">14px · 500 · caption / buttons</p><div style="font-size: var(--text-sm)">Captions, metadata, secondary buttons.</div>
<p class="spec">12px · 500 · micro</p><div style="font-size: var(--text-xs); color: var(--muted)">Timestamps, footnotes, legal.</div>
<p class="spec">44px · 700 · streak numeral (completion moments only)</p><div class="d" style="font-size: var(--text-3xl); font-weight: 700">6</div>`,
  },
  {
    file: 'spacing-shape.html', group: 'Foundations', name: 'Spacing, radius & elevation',
    subtitle: '8px rhythm · soft-circle geometry · three-layer lift', width: 760,
    implements: 'DS-1',
    css: `.bar { background: color-mix(in srgb, var(--accent) 14%, var(--surface)); border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--border)); height: 20px; border-radius: 4px; }
.lbl { font-size: var(--text-xs); color: var(--muted); width: 88px; flex: none; }
.shape { background: var(--surface); border: 1px solid var(--border); width: 96px; height: 64px; display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); color: var(--muted); }
.elev { width: 150px; padding: var(--space-4); border-radius: var(--radius-md); font-size: var(--text-xs); color: var(--muted); background: var(--surface); }`,
    body: `<h1>Spacing</h1>
<div class="stack">
${[1, 2, 3, 4, 6, 8, 12].map(n => `  <div class="row"><span class="lbl">--space-${n}</span><div class="bar" style="width: calc(var(--space-${n}) * 4)"></div></div>`).join('\n')}
</div>
<h2>Radius</h2>
<div class="row">
  <div class="shape" style="border-radius: var(--radius-sm)">sm · buttons</div>
  <div class="shape" style="border-radius: var(--radius-md)">md · cards</div>
  <div class="shape" style="border-radius: var(--radius-lg)">lg · panels</div>
  <div class="shape" style="border-radius: var(--radius-pill); width: 64px">pill</div>
</div>
<h2>Elevation — flat by default, three-layer lift for panels</h2>
<div class="row">
  <div class="elev" style="box-shadow: var(--elev-flat); border: 1px solid var(--border)">flat — cards on canvas</div>
  <div class="elev" style="box-shadow: var(--elev-ring)">ring</div>
  <div class="elev" style="box-shadow: var(--elev-raised)">raised — approve panel, modals, docked chat</div>
</div>`,
  },
  {
    file: 'buttons.html', group: 'Components', name: 'Buttons',
    subtitle: 'Primary approve / secondary / quiet / destructive', width: 720,
    implements: 'DS-2 DS-4',
    body: `<h1>Buttons</h1>
<h2>Primary — the screen's one accent action</h2>
<div class="row"><button class="btn btn-primary">Approve</button><button class="btn btn-primary">Approve all 5</button><button class="btn btn-primary" disabled>Approve</button></div>
<h2>Secondary & quiet</h2>
<div class="row"><button class="btn btn-secondary">Edit</button><button class="btn btn-secondary">Choose a photo</button><button class="btn btn-quiet">Skip</button><button class="btn btn-quiet">Not now</button></div>
<h2>Destructive — kill switch family (always one gesture, never buried)</h2>
<div class="row"><button class="btn btn-danger">Pause everything</button><button class="btn btn-danger">Pause X only</button></div>`,
  },
  {
    file: 'inputs.html', group: 'Components', name: 'Inputs',
    subtitle: 'Text field states + redirect box', width: 720,
    implements: 'DS-4 DS-5',
    css: `.field { width: 100%; font: inherit; font-size: var(--text-sm); color: var(--fg); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; }
.field:focus { outline: none; border-color: var(--fg); box-shadow: var(--focus-ring); }
.field.error { border-color: var(--danger); }
.err { color: var(--danger); font-size: var(--text-xs); margin-top: var(--space-1); }`,
    body: `<h1>Inputs</h1>
<div class="stack">
  <input class="field" placeholder="Your organization's name" />
  <input class="field" value="hopeandpaws" style="border-color: var(--fg); box-shadow: var(--focus-ring)" />
  <div><input class="field error" value="not-an-email" /><div class="err">That doesn't look like an email — one more try?</div></div>
  <div>
    <textarea class="field" rows="2" placeholder="Tell me anything — &quot;less formal&quot;, &quot;never name donors&quot;, &quot;more about the kids&quot;…"></textarea>
    <div class="reason" style="margin-top: var(--space-1)">Redirects become permanent rules — I'll confirm what I understood before saving.</div>
  </div>
</div>`,
  },
  {
    file: 'post-card.html', group: 'Components', name: 'Post card',
    subtitle: 'Inbox draft — photo, fit badges, reason, actions', width: 460,
    implements: 'DS-2 DS-5 DS-6',
    css: `main { max-width: 420px; }
.pc { display: flex; flex-direction: column; gap: var(--space-3); }
.meta-row { display: flex; gap: var(--space-2); align-items: center; font-size: var(--text-xs); color: var(--muted); font-weight: 600; }
.cat { text-transform: none; background: var(--surface-warm); padding: 3px 10px; border-radius: var(--radius-pill); color: var(--fg-2); }
.txt { font-size: var(--text-base); }`,
    body: `<article class="pc">
  ${PHOTO}
  <div class="meta-row"><span class="cat">Impact story</span><span>Facebook · Instagram · X</span></div>
  <div class="txt">The well in Kamuli is running. Three months ago you helped us break ground — this week, 400 families drew clean water for the first time. Here's what your support built.</div>
  <div class="reason">Your donors were promised a progress report when drilling started — this closes that loop.</div>
  <div class="row"><span class="fit ok">FB</span><span class="fit ok">IG</span><span class="fit skip" title="skipped">X</span><span class="note">skipped X: over policy "no long stories on X" — override?</span></div>
  <div class="row" style="justify-content: space-between">
    <button class="btn btn-primary">Approve</button>
    <span class="row" style="gap: 0"><button class="btn btn-quiet">Edit</button><button class="btn btn-quiet">Skip</button><button class="btn btn-quiet">Redirect…</button></span>
  </div>
</article>`,
  },
  {
    file: 'approve-panel.html', group: 'Components', name: 'Approve panel',
    subtitle: 'Sticky right rail on desktop, bottom bar on mobile', width: 460,
    implements: 'DS-2 DS-5',
    css: `main { max-width: 400px; }
.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--elev-raised); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-3); }
.chan { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid var(--border-soft); font-size: var(--text-sm); }
.dot { width: 10px; height: 10px; border-radius: var(--radius-pill); background: var(--success); display: inline-block; margin-right: var(--space-2); }
.dot.off { background: var(--meta); }`,
    body: `<aside class="panel">
  <div style="font-size: var(--text-lg); font-weight: 600; line-height: var(--leading-tight)">Ready to publish</div>
  <div>
    <div class="chan"><span><span class="dot"></span>Facebook</span><span class="note">Tue 9:05 am</span></div>
    <div class="chan"><span><span class="dot"></span>Instagram</span><span class="note">Tue 12:30 pm</span></div>
    <div class="chan"><span><span class="dot off"></span>X — skipped</span><button class="btn btn-quiet" style="padding: 2px 6px">override</button></div>
  </div>
  <button class="btn btn-primary" style="width: 100%">Approve</button>
  <div class="reason">I picked the times your followers are usually around. Change anything — or just tell me.</div>
</aside>`,
  },
  {
    file: 'chat-message.html', group: 'Components', name: 'Chat rhythm',
    subtitle: 'Colleague presence — never a support widget', width: 640,
    implements: 'DS-5 DS-6',
    css: `.msg { display: flex; gap: var(--space-3); max-width: 92%; }
.msg .body { display: flex; flex-direction: column; gap: var(--space-2); }
.who { font-size: var(--text-xs); font-weight: 600; color: var(--muted); }
.mine { align-self: flex-end; background: var(--surface-warm); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); max-width: 80%; }
.mini { border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-3); font-size: var(--text-sm); display: flex; gap: var(--space-3); align-items: center; }
.thumb { width: 56px; height: 42px; border-radius: var(--radius-sm); background: #d5cabb; flex: none; }`,
    body: `<div class="stack" style="gap: var(--space-4)">
  <div class="msg"><span class="avatar">S</span><div class="body"><span class="who">Steward</span>
    <div>You mentioned the first family you helped — what happened to them? That's exactly the story donors connect with.</div>
  </div></div>
  <div class="mine">They still visit every month! The kids volunteer at our events now.</div>
  <div class="msg"><span class="avatar">S</span><div class="body"><span class="who">Steward</span>
    <div>That's wonderful — and a perfect full-circle story. I'll draft it as next week's impact post; you'll see it in your digest.</div>
    <div class="mini"><span class="thumb"></span><span><strong>Full circle: the family that started it all</strong><br/><span class="note">draft · impact story · arriving in Tuesday's digest</span></span></div>
  </div></div>
</div>`,
  },
  {
    file: 'reason-line.html', group: 'Trust', name: 'ReasonLine',
    subtitle: 'Every system-initiated item says why', width: 640,
    implements: 'DS-5',
    body: `<h1>ReasonLine</h1>
<div class="stack">
  <div class="reason">Your beach cleanup is Saturday — donors respond best to before/after pairs, so I'd love 3 photos.</div>
  <div class="reason">We've asked twice without reporting back — this impact post should come first.</div>
  <div class="reason">GivingTuesday is in 5 weeks. Here's the campaign I'd run — approve once and I'll handle the rest.</div>
</div>
<p class="note" style="margin-top: var(--space-4)">Rule: no request, draft, or nudge ships without one. Quiet, one line, muted ink.</p>`,
  },
  {
    file: 'fit-badge.html', group: 'Trust', name: 'FitBadge',
    subtitle: 'Per-channel fit or skip-with-reason', width: 640,
    implements: 'DS-5',
    body: `<h1>FitBadge</h1>
<div class="row"><span class="fit ok">FB</span><span class="fit ok">IG</span><span class="fit ok">Threads</span><span class="fit skip">X</span></div>
<div class="reason" style="margin-top: var(--space-3)">skipped X: over policy "no long stories on X" — tap to override for this post.</div>
<p class="note" style="margin-top: var(--space-4)">Fit is a decision the founder can always see and always overrule.</p>`,
  },
  {
    file: 'trust-level.html', group: 'Trust', name: 'TrustLevel',
    subtitle: 'Earned autonomy — offered, never taken', width: 680,
    implements: 'DS-5',
    css: `.tl { display: flex; gap: var(--space-2); }
.tl span { flex: 1; text-align: center; font-size: var(--text-xs); font-weight: 600; padding: var(--space-2) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-pill); color: var(--muted); }
.tl .on { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, var(--surface)); }
.krow { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-6); padding: var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-md); }`,
    body: `<h1>TrustLevel</h1>
<div class="tl"><span class="on">TL0 · I ask first</span><span>TL1 · I publish, you can veto for 24h</span><span>TL2 · Full autopilot</span></div>
<div class="reason" style="margin-top: var(--space-3)">Impact stories: you've approved 10 in a row unchanged — want me to start publishing these on my own, with a 24-hour veto window?</div>
<div class="krow"><span style="font-size: var(--text-sm)"><strong>Kill switch</strong><br/><span class="note">pauses all publishing instantly</span></span><button class="btn btn-danger">Pause everything</button></div>`,
  },
  {
    file: 'assumed-note.html', group: 'Trust', name: 'AssumedNote',
    subtitle: 'Visible defaults with a one-tap correction', width: 640,
    implements: 'DS-5',
    body: `<h1>AssumedNote</h1>
<div class="stack">
  <div class="assumed"><span class="tag">assumed</span><span>Your service area is Travis County — I read it off your website. <a href="#">Not right?</a></span></div>
  <div class="assumed"><span class="tag">assumed</span><span>I'm treating "the shelter" and "Hope & Paws" as the same place. <a href="#">Fix</a></span></div>
</div>
<p class="note" style="margin-top: var(--space-4)">Anything defaulted instead of asked is marked — never silently guessed (VAL-3, MEM-2).</p>`,
  },
  {
    file: 'awaiting-picture.html', group: 'Trust', name: 'Awaiting picture',
    subtitle: 'Written, visible, blocked — with a next step', width: 460,
    implements: 'DS-5 DS-6',
    css: `main { max-width: 420px; }
.slot { aspect-ratio: 4 / 3; border: 2px dashed color-mix(in srgb, var(--warn) 45%, var(--border)); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: var(--space-2); align-items: center; justify-content: center; color: var(--muted); font-size: var(--text-sm); background: color-mix(in srgb, var(--warn) 4%, var(--surface)); }
.sugg { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
.sugg span { width: 64px; height: 48px; border-radius: var(--radius-sm); background: #d5cabb; }`,
    body: `<div class="slot"><strong style="color: var(--fg-2)">Needs a photo before it can go out</strong><span>the words are ready — add one and I'll schedule it</span><button class="btn btn-secondary">Choose from library</button></div>
<div class="sugg"><span></span><span></span><span></span></div>
<div class="reason" style="margin-top: var(--space-2)">These three from March look right for this story.</div>`,
  },
  {
    file: 'empty-states.html', group: 'Voice', name: 'Zero states',
    subtitle: 'The system narrates — never a blank page', width: 680,
    implements: 'DS-6',
    css: `.zero { border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-8); display: flex; flex-direction: column; gap: var(--space-3); align-items: flex-start; }
.streak { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; line-height: var(--leading-tight); letter-spacing: var(--tracking-display); }`,
    body: `<h1>Zero states</h1>
<div class="stack" style="gap: var(--space-4)">
  <div class="zero">
    <div class="row"><span class="avatar">S</span><strong>I'm reading your website now.</strong></div>
    <div class="note">First drafts in about ten minutes. Want to chat while we wait? I have a few questions only you can answer.</div>
    <button class="btn btn-secondary">Sure, let's talk</button>
  </div>
  <div class="zero">
    <div class="streak">6<span style="font-size: var(--text-base); font-weight: 600; margin-left: var(--space-2)">week streak</span></div>
    <div>That's everything for this week — 5 posts heading out. See you next Tuesday.</div>
    <div class="reason">Next up from me: photos request for Saturday's cleanup, and your GivingTuesday plan.</div>
  </div>
</div>`,
  },
  {
    file: 'held-for-approval.html', group: 'Trust', name: 'HeldForApproval',
    subtitle: 'Sensitive-topic hold — approval forced at any Trust Level (GR-3)', width: 460,
    implements: 'DS-5',
    css: `main { max-width: 420px; }
.held { background: var(--surface); border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--border)); border-radius: var(--radius-md); box-shadow: inset 3px 0 0 var(--accent); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
.hh { display: inline-flex; gap: var(--space-2); align-items: center; font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent); }
.hh .d { width: 6px; height: 6px; border-radius: var(--radius-pill); background: var(--accent); }`,
    body: `<article class="held">
  <span class="hh"><span class="d"></span>Held for your approval</span>
  <div>A note on the flooding at the county shelter — how we're helping the animals displaced this week, and how neighbors can pitch in.</div>
  <div class="reason">This touches a sensitive topic, so I'm not publishing it myself — it's yours to approve, whatever your trust settings.</div>
  <div class="row"><button class="btn btn-primary">Approve</button><button class="btn btn-quiet">Edit</button><button class="btn btn-quiet">Redirect…</button></div>
</article>
<p class="note" style="margin-top: var(--space-4)">Counted in the inbox, never batch-approvable, visually the inverse of the veto-window card — a hard guardrail with a face (GR-3).</p>`,
  },
  {
    file: 'veto-window.html', group: 'Trust', name: 'Veto-window card',
    subtitle: 'TL1 auto-publish — visible, reversible, no action needed', width: 460,
    implements: 'DS-5',
    css: `main { max-width: 420px; }
.veto { background: var(--surface-warm); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
.vh { display: inline-flex; gap: var(--space-2); align-items: center; font-size: var(--text-xs); font-weight: 600; color: var(--muted); }
.vh .d { width: 6px; height: 6px; border-radius: var(--radius-pill); background: var(--success); }`,
    body: `<article class="veto">
  <span class="vh"><span class="d"></span>Published · you can veto until Thu 6:00 pm</span>
  <div>Volunteer spotlight: Maria's 200th shift — went out to Facebook and Instagram this morning.</div>
  <div class="reason">You've approved 10 of these unedited, so I published on your behalf. Undo any time in the window.</div>
  <div class="row"><button class="btn btn-quiet">Veto &amp; pull it</button><button class="btn btn-quiet">See what went out</button></div>
</article>
<p class="note" style="margin-top: var(--space-4)">Quiet, informational register — excluded from the "N of M" count and batch-approve, never confusable with a needs-approval card.</p>`,
  },
  {
    file: 'provenance-line.html', group: 'Trust', name: 'ProvenanceLine',
    subtitle: 'What a draft was built from — tap through to Memory', width: 640,
    implements: 'DS-5',
    css: `.prov { display: flex; gap: var(--space-2); align-items: baseline; font-size: var(--text-xs); color: var(--meta); }
.prov a { color: var(--muted); text-decoration: underline dotted; text-underline-offset: 2px; }`,
    body: `<h1>ProvenanceLine</h1>
<div class="stack">
  <div class="prov">Built from <a href="#">your update last Tuesday</a> · <a href="#">your website</a></div>
  <div class="prov">Built from <a href="#">3 photos you sent Saturday</a> · <a href="#">the interview</a></div>
  <div class="prov">Built from <a href="#">the County Wildlife Report</a> — external</div>
</div>
<p class="note" style="margin-top: var(--space-4)">Every draft carries one — "this one it made up" is never a question. One muted line; a tap opens the source in Memory (DEC-8, VAL-3).</p>`,
  },
  {
    file: 'optional-reason.html', group: 'Trust', name: 'OptionalReason',
    subtitle: 'One-tap, dismissible — shared by Skip, veto, radar marks', width: 640,
    implements: 'DS-5',
    css: `.chips { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.rchip { font: inherit; font-weight: 500; font-size: var(--text-sm); cursor: pointer; border: 1px solid var(--border); background: var(--surface); color: var(--fg-2); border-radius: var(--radius-pill); padding: 6px 14px; }
.rchip:hover { border-color: var(--fg); }`,
    body: `<h1>OptionalReason</h1>
<div class="card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); max-width: 460px">
  <div style="font-size: var(--text-sm)">Skipped. Mind saying why? <span class="note">(optional — it helps me learn)</span></div>
  <div class="chips"><button class="rchip">Not now</button><button class="rchip">Not our style</button><button class="rchip">Wrong facts</button><button class="rchip">Tell me…</button></div>
</div>
<p class="note" style="margin-top: var(--space-4)">Appears after the action — the card's already gone from the count, so answering is a gift, never a toll. Same affordance for veto and radar marks.</p>`,
  },
  {
    file: 'citation-block.html', group: 'Trust', name: 'CitationBlock',
    subtitle: 'Mandatory source + commentary framing (GR-5)', width: 640,
    implements: 'DS-5',
    css: `.cite { border-left: 3px solid color-mix(in srgb, var(--accent) 40%, var(--border)); background: var(--surface-warm); border-radius: var(--radius-sm); padding: var(--space-3) var(--space-4); font-size: var(--text-sm); display: flex; flex-direction: column; gap: 4px; }
.cite .src { font-weight: 600; color: var(--fg-2); }
.cite a { color: var(--accent); }`,
    body: `<h1>CitationBlock</h1>
<div class="stack" style="max-width: 520px">
  <div style="font-size: var(--text-base)">Wetlands like ours filter a city's water for free — and our county just lost 12% of them in a decade. Here's why the marsh restoration you funded matters more than ever.</div>
  <div class="cite"><span class="src">County Wildlife Report, March 2026</span><a href="#">conservation.example.org/report</a></div>
</div>
<p class="note" style="margin-top: var(--space-4)">Every external-content post carries its source and the org's own framing — never rehashed news (GR-5). One treatment, shared by inbox external cards and public articles.</p>`,
  },
  {
    file: 'article-link.html', group: 'Trust', name: 'ArticleLink badge',
    subtitle: 'Which social variant carries the news-page link (NWS-5)', width: 640,
    implements: 'DS-5',
    css: `.alink { display: inline-flex; gap: 6px; align-items: center; font-size: var(--text-xs); font-weight: 600; padding: 4px 10px; border-radius: var(--radius-pill); border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--border)); color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, var(--surface)); }`,
    body: `<h1>ArticleLink badge</h1>
<div class="row"><span class="fit ok">FB</span><span class="fit ok">IG</span><span class="alink">X · links to your article</span><span class="alink">Threads · links to your article</span></div>
<div class="reason" style="margin-top: var(--space-3)">X and Threads are length-limited, so those variants carry a short post plus a link to the full story on your news page.</div>
<p class="note" style="margin-top: var(--space-4)">FitBadge's sibling — never links to an unpublished article.</p>`,
  },
  {
    file: 'news-template.html', group: 'News', name: 'News page template',
    subtitle: 'Org-branded public reading surface — name/logo/accent slots (DS-8)', width: 680,
    implements: 'DS-8',
    css: `main { max-width: 640px; }
.masthead { display: flex; align-items: center; gap: var(--space-3); padding-bottom: var(--space-4); border-bottom: 1px solid var(--border); }
.orglogo { width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--accent); color: var(--accent-on); display: grid; place-items: center; font-weight: 700; font-family: var(--font-display); }
.orgname { font-family: var(--font-display); font-weight: 700; font-size: var(--text-lg); letter-spacing: var(--tracking-display); }
.article { padding: var(--space-6) 0; display: flex; flex-direction: column; gap: var(--space-4); }
.headline { font-family: var(--font-display); font-weight: 700; font-size: var(--text-2xl); line-height: var(--leading-tight); letter-spacing: var(--tracking-display); margin: 0; }
.tags { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.tag2 { font-size: var(--text-xs); color: var(--muted); background: var(--surface-warm); border-radius: var(--radius-pill); padding: 4px 10px; }
.pgfooter { border-top: 1px solid var(--border); padding-top: var(--space-4); font-size: var(--text-xs); color: var(--meta); display: flex; justify-content: space-between; align-items: center; }`,
    body: `<div class="masthead"><span class="orglogo">H</span><span class="orgname">Hope &amp; Paws</span><span class="note" style="margin-left: auto">Stories</span></div>
<article class="article">
  <div class="tags"><span class="tag2">Impact</span><span class="tag2">Adoptions</span></div>
  <h1 class="headline">The senior dogs nobody expected to adopt — and the weekend that changed everything</h1>
  ${PHOTO}
  <div style="font-size: var(--text-base)">Two hundred and fourteen days. That's how long Biscuit waited for a family. This Saturday, at our adoption day, everything changed — because of a community that keeps showing up.</div>
</article>
<div class="pgfooter"><span>Published with Steward</span><span>news.hopeandpaws.org</span></div>`,
  },
];

const outDir = join(here, 'preview');
mkdirSync(outDir, { recursive: true });
for (const c of cards) {
  const html = `<!-- @dsCard group="${c.group}" name="${c.name}" subtitle="${c.subtitle}" width="${c.width}" -->
<!-- @implements ${c.implements} — generated by build-previews.mjs, do not edit by hand -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet" />
<title>Steward — ${c.name}</title>
<style>
${root}
${BASE}
${c.css ?? ''}
</style>
</head>
<body>
<main>
${c.body}
</main>
</body>
</html>
`;
  writeFileSync(join(outDir, c.file), html);
  console.log('wrote preview/' + c.file);
}
console.log(`${cards.length} cards generated from tokens.css`);
