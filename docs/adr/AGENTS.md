# Architectural decision records

Scope: `docs/adr/`. ADR records why a decision was made, for reader years later with no access to deciders. Write from `docs/adr/TEMPLATE.md`.

## The bar

All three must hold:

- **Hard to reverse.** Easy reversal → just reverse it.
- **Surprising without context.** Unsurprising decisions raise no questions.
- **Result of real trade-off.** No alternative → nothing to record beyond the obvious.

Qualifying ground: architectural shape; integration patterns between contexts; technology choices with lock-in; boundary + ownership decisions, including explicit no-s; deliberate deviations from obvious path; constraints invisible in code; rejected alternatives whose rejection is non-obvious.

Offer ADRs sparingly. ADRs for routine choices train readers to ignore all ADRs.

## Frontmatter

One field per line, so plain-text search works.

```yaml
---
id: 0007
title: Communicate between Ordering and Billing via domain events
status: accepted # proposed | accepted | superseded | deprecated
date: 2026-01-30
deciders: [ada-lovelace, grace-hopper]
tags: [integration, messaging]
supersedes: 0003-synchronous-billing-calls
superseded-by:
---
```

- `id`: four digits, zero-padded, highest existing + 1.
- `tags`: lowercase, hyphenated. Reuse existing tag before coining new one.
- `supersedes`, `superseded-by`: other ADR's filename without extension, or empty.
- Filename: `<id>-<kebab-case-title>.md`, matching `id` + `title`.

## Searching

- In force: `rg -l '^status: accepted' docs/adr`
- Decided about X: `rg -il '^(title|tags):.*x' docs/adr`
- Act only on `status: accepted`. `proposed` / `superseded` ADR ≠ constraint.

## Changing a decision

- Update/refinement without reversal → amend existing ADR: edit body in place + dated Amendments entry (what changed, why).
- Reversal or outright replacement → new ADR. Old: `status: superseded`, `superseded-by: <new filename>`. New: `supersedes: <old filename>`.
