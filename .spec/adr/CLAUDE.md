# adr/ — Architecture Decision Records

The append-only decision journal. ADRs answer *why this technical choice* — the one place ordinal numbering survives in this project (append-only, never reordered, short citation handles). ID comes from the filename: `NNNN-slug.md` defines `ADR-NNNN`.

**Statuses:** `proposed` → `accepted` | `rejected` → `superseded` (by a later ADR).

Rules:
- Never overturn an `accepted` ADR silently — write a superseding ADR.
- A **`rejected` ADR is a binding constraint**: it records why an option was turned down, and agents must not re-propose it without new information (cite the ADR when declining to revisit).
- Architecture docs ([../architecture/](../architecture/)) describe the *current* design and link the ADRs justifying it; the ADR holds the alternatives and rationale (single source of truth for the "why").
- **Only `accepted` ADRs may appear in a spec's `constrained-by` list** (DCX-11). Superseding an ADR therefore cascades: every citing spec goes red until consciously re-pointed at the successor — architecture evolves loudly, never silently.

Use [TEMPLATE.md](TEMPLATE.md).

## Index

| ADR | Title | Status |
|---|---|---|
| *(first ADRs arrive with the repo skeleton — including one consolidating the constitution-fixed stack choices)* | | |
