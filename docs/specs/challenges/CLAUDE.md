# challenges/ — Architect Challenger Evidence Records

Verbatim verdicts from Architect Challenger runs — the evidence behind every spec's `challenge:` block (DCX-13: a verdict without evidence is not a verdict). One file per run: `<spec-slug>-<date>-r<round>.md`, frontmatter `kind: challenge-record` with `spec`, `round`, `date`, `verdict`, `by`.

These files are **exempt from reference resolution** (DCX-3): they quote adversarial attack payloads verbatim, which by nature cite deliberately invalid IDs. They remain parse- and schema-validated, and the lint cross-checks each spec's challenge block against its record (existence, spec name, verdict agreement).

Records are append-only history — a superseded verdict is never edited or deleted; the spec's `challenge.record` simply points at the latest.
