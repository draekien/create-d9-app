# Documentation

Scope: everything under `docs/`. Five directories, one purpose each. Place doc by purpose. No new top-level directories under `docs/`.

| Directory | Holds | Lifetime |
| --- | --- | --- |
| `adr/` | Architectural decision records | Permanent. Amend in place for updates; supersede only for reversal |
| `references/` | External material: API docs, `llms.txt` indexes, specs, vendor guides | Refresh when source changes |
| `explorations/` | Option investigations: evidence + what it favours. Not commitment to act | Kept as record of what was examined |
| `plans/` | Proposed work, written before doing it | `done` once executed |
| `contexts/` | Guidance only some tasks need; reached via pointer in root `AGENTS.md` | Update when stated convention changes |

- Before starting work: search `docs/explorations/` + `docs/plans/` for topic; search `docs/adr/` for constraining decision.
- Before reading/writing ADR: read `docs/adr/AGENTS.md`. Bar high; most decisions fail it.

## Explorations and plans

Filename `YYYY-MM-DD-short-title.md`. Frontmatter:

```yaml
---
title: Short title
date: YYYY-MM-DD
status: active # active | superseded | done
supersedes: # optional, filename of the document this replaces
---
```

- Exploration records: question, options examined, evidence per option, what evidence favours. May end without recommendation; say so, never manufacture one.
- Plan records: goal, steps, finish criteria; links exploration or ADR it follows from.

## References

- Filename describes source: `stripe-api.md`, `react-router-llms.txt`.
- Top of file: source + capture date, so staleness visible.

## Contexts

- Filename names topic: `releasing.md`, `migrations.md`.
- First line: tasks that need the doc, so arriving agent knows if relevant.
- Reached only via pointer in root `AGENTS.md`; pointer names triggering task, never just directory. Context doc with no pointer = unreachable.
- Guidance whose tasks cannot be named ≠ context. Goes in root `AGENTS.md`, read every turn.

## Status discipline

Applies to explorations and plans.

- Stale `active` doc worse than missing: agent acts on it.
- Work ships → `done`. Later doc replaces → `superseded`; name replacement in both. Same change that finishes the work.
- Never delete.

