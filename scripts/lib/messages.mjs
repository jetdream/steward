/**
 * messages — the single source of every lint message (DCX-15 v2).
 *
 * Imported by the producers (scripts/lib/docs-graph.mjs,
 * scripts/docs-check.mjs) and the consumer (scripts/test-docs-check.mjs):
 * rewording a message here updates both sides atomically, so assertion
 * drift is impossible. The harness matches these EXACTLY against parsed
 * per-error entries — each template embeds its subject, which is what makes
 * exact matching precise about which check fired on what.
 *
 * Grouped by the DCX item that emits them.
 */

export const MSG = {
  // -- parser (surface as DCX-4 parse validity) ------------------------------
  unexpectedIndentation: () => 'unexpected indentation',
  expectedKey: () => 'expected "key:" or "key: value"',
  duplicateKey: (key, firstLine) => `duplicate key "${key}" (first at line ${firstLine})`,
  unterminatedArray: () => 'unterminated inline array',

  // -- graph construction (DCX-1) --------------------------------------------
  invalidItemKey: (key) => `item key "${key}" is not a valid ID`,
  duplicateDefinition: (id, firstRel) => `duplicate definition of ${id} (first in ${firstRel})`,

  // -- DCX-2: prefix ownership ------------------------------------------------
  filenameOwnedClaim: (prefix) => `DCX-2: prefix ${prefix} is filename-owned (adr/NNNN-slug.md) and cannot be claimed by a register`,
  unregisteredClaim: (prefix) => `DCX-2: prefix ${prefix} claimed but not registered in docs/CLAUDE.md`,
  prefixAlreadyOwned: (prefix, ownerRel) => `DCX-2: prefix ${prefix} already owned by ${ownerRel}`,
  filenameOwnedDefinition: (id) => `DCX-2: ${id} must be defined by an adr/NNNN-slug.md filename, not an items entry`,
  unregisteredDefinition: (id, prefix) => `DCX-2: ${id} defined under unregistered prefix ${prefix} — register it in docs/CLAUDE.md first`,
  unclaimedPrefix: (id, prefix) => `DCX-2: ${id} defined but no file claims prefix ${prefix} — the ownership invariant must not silently vanish`,
  outsideOwningFile: (id, ownerRel) => `DCX-2: ${id} defined outside owning file ${ownerRel}`,

  // -- DCX-3: referential integrity -------------------------------------------
  unregisteredPrefixRef: (id) => `DCX-3: unregistered prefix in "${id}" — register it in docs/CLAUDE.md or rename`,
  undefinedRef: (id) => `DCX-3: reference to undefined ID ${id}`,
  undefinedBehaviorKey: (id) => `DCX-3: behavior key references undefined ID ${id}`,

  // -- DCX-5: version pins ------------------------------------------------------
  stalePin: (id, pin, current) => `DCX-5: stale pin ${id} v${pin} (current: v${current})`,

  // -- DCX-4: schema validity ---------------------------------------------------
  registerMissingPrefix: () => 'DCX-4: register missing prefix',
  registerMissingTitle: () => 'DCX-4: register missing title',
  invalidStatus: (status) => `DCX-4: invalid status "${status}"`,
  registerMissingItems: () => 'DCX-4: register missing items map',
  requirementsMissingServes: () => 'DCX-4: requirements register missing serves list',
  invalidSpecStatus: (status) => `DCX-4: invalid spec status "${status}"`,
  specMissingImplements: () => 'DCX-4: spec missing implements list',
  dependsOnUnregistered: (prefix) => `DCX-4: depends-on has unregistered prefix "${prefix}"`,
  glossaryMissingTerms: () => 'DCX-4: glossary missing terms map',
  architectureNeedsTitle: () => 'DCX-4: architecture doc needs a title',
  invalidArchitectureStatus: (status) => `DCX-4: invalid architecture status "${status}"`,
  unknownKind: (kind) => `DCX-4: unknown kind "${kind}"`,
  itemNeedsVersion: (id) => `DCX-4: ${id} needs a numeric v (version)`,
  itemNeedsStatement: (id) => `DCX-4: ${id} needs a statement (or rule)`,
  itemNeedsPriority: (id) => `DCX-4: ${id} needs priority P0|P1|P2`,
  itemNeedsStatus: (id) => `DCX-4: ${id} needs status open|resolved`,
  itemNeedsLearningType: (id) => `DCX-4: ${id} needs type gotcha|dead-end|pattern`,
  itemNeedsScope: (id) => `DCX-4: ${id} needs a scope list`,
  invalidFlexibility: (id, value) => `DCX-4: ${id} has invalid flexibility "${value}"`,
  itemFieldMustBeList: (id, field) => `DCX-4: ${id} field ${field} must be a list`,
  recordOutsideChallenges: () => 'DCX-4: challenge-record outside docs/specs/challenges/ — the reference exemption is bound to that directory',
  recordMissingField: (field) => `DCX-4: challenge-record missing ${field}`,
  recordInvalidVerdict: () => 'DCX-4: challenge-record verdict must be pass|fail',
  approvedBlockShape: () => 'DCX-4: approved block needs date and by',

  // -- DCX-11: design edge --------------------------------------------------------
  needsDesignScope: () => 'DCX-11: approved spec needs design-scope local|cross-cutting',
  crossCuttingNeedsConstraints: () => 'DCX-11: cross-cutting spec needs a non-empty constrained-by list',
  constraintUndefinedAdr: (entry) => `DCX-11: constrained-by cites undefined ${entry}`,
  constraintPhantomAdr: (entry) => `DCX-11: ${entry} is not a filename-defined decision record — a phantom ADR cannot constrain a spec`,
  constraintAdrNotAccepted: (entry, status) => `DCX-11: ${entry} has status "${status}" — only accepted ADRs may constrain a spec (superseding cascades here)`,
  constraintPathNotFound: (entry) => `DCX-11: constrained-by path not found: ${entry}`,
  constraintNotArchitecture: (entry, kind) => `DCX-11: ${entry} is kind "${kind}" — only architecture docs may constrain a spec by path`,
  constraintArchitectureNotApproved: (entry, status) => `DCX-11: ${entry} has status "${status}" — architecture must be approved before specs build on it`,

  // -- DCX-12 / DCX-13: design section + challenge evidence -------------------------
  needsDesignSection: () => 'DCX-12: approved spec needs a non-empty design section',
  needsChallengeBlock: () => 'DCX-13: approved spec needs an Architect Challenger record (challenge: date/by/verdict: pass/summary/record)',
  recordOutsideDir: (record) => `DCX-13: challenge record must live under docs/specs/challenges/ (got ${record})`,
  recordNotFound: (record) => `DCX-13: challenge record not found: ${record}`,
  recordWrongKind: (record) => `DCX-13: ${record} is not a challenge-record`,
  recordWrongSpec: (record, named, actual) => `DCX-13: ${record} names spec "${named}", not ${actual}`,
  recordVerdictMismatch: (block, record) => `DCX-13: verdict mismatch — block says "${block}", record says "${record}"`,
  recordEvidenceDisagrees: (record, verdict) => `DCX-13: ${record} body has no "VERDICT: ${verdict}" line — evidence disagrees with the wrapper`,

  // -- DCX-7 / DCX-14: hygiene + repo gate ------------------------------------------
  missingFolderClaude: () => 'DCX-7: missing CLAUDE.md in this folder',
  unexpectedExtension: () => 'DCX-7: unexpected extension under docs/ — only .yaml and .md are lintable (rename or move)',
  missingPreCommitGate: (candidates) => `DCX-14: no pre-commit hook running docs-check found (${candidates})`,
};
