---
id: 0003
title: Generate templates at build time from upstream tools
status: accepted
date: 2026-10-10
deciders: [william-pei]
tags: [templates, dependencies]
supersedes:
superseded-by:
---

# 0003 — Generate templates at build time from upstream tools

## Context

Parts of a generated project are produced by upstream CLIs: shadcn components (`shadcn add`), agent skills (`skills add`), TanStack Intent wiring. The published CLI has zero runtime dependencies, runs on every create path, and must produce a project where install, build, lint, and typecheck pass (`docs/contexts/scaffold-options.md`). ADR 0001 requires exact pinned versions, never resolved at scaffold time.

The shadcn package exports `addRegistryItems` from `shadcn/registry` but not `init`; the `skills` package exports no API, only a bin. Calling either as a library inside the published CLI bundles shadcn's runtime dependencies (`ts-morph`, `@babel/core`, `recast`, `postcss`, `execa`) and still fetches registry content over the network at scaffold time. `create-better-t-stack`, `sv`, and `@tanstack/cli` run upstream CLIs with `@latest` during scaffolding.

## Decision

We will run upstream tools inside this repository, at pinned versions, through a refresh script, and commit their output under `templates/`. The published CLI only copies files from `templates/`; it never runs an upstream tool and never reaches the network for template content. A GitHub Actions workflow, scheduled on the 1st and 15th of each month and on manual dispatch, runs the refresh script, bumps pins, regenerates output, runs the regression suite, and auto-merges patch and minor changes; major bumps wait for human review.

## Consequences

A scaffold works offline and installs exactly what the regression suite tested. Every upstream change arrives as a reviewable diff in a pull request. Templates trail upstream by at least one day (pnpm `minimumReleaseAge` default 1440 minutes) and by one release cycle of this CLI. The refresh script and the scheduled workflow are code this repository maintains, with no prior art in other `create-*` CLIs. Template content that no upstream CLI produces is hand-written and kept current only by pin bumps.

## Alternatives considered

**Run upstream CLIs at scaffold time with pinned versions** (`pnpm dlx shadcn@<version>`). Rejected because shadcn registry content and preset resolution are fetched live, so a registry change can break a scaffold with no change in this repository, and scaffolding fails offline.

**Bundle shadcn into the CLI and call `addRegistryItems`.** Rejected because it adds shadcn's runtime dependency tree to every `pnpm create` download, still fetches registry content live, and does not cover `init`.

**Fetch skill and registry files at scaffold time from pinned commit SHAs.** Rejected because it needs network at scaffold time and reimplementing shadcn's alias and CSS-variable transforms.

## Amendments

- 2026-10-10: Refresh schedule set to the 1st and 15th of each month instead of daily, to reduce pull request volume.
- 2026-10-10: Each major bump opens its own pull request on branch `bot/major-<slug>` with auto-merge off, so the owner reviews breaking changes one at a time.
