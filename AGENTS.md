# create-d9-app

## Purpose

Public npm `create-*` CLI, published as `@draekien/create-d9-app`; personal project. Scaffolds Turborepo monorepo. Default stack: `@tanstack/*`, Biome, TypeScript 7, pnpm, Lefthook, Turborepo, shadcn, Tailwind, Motion.

- Every tool = pick-and-mix choice with alternatives; default stack preselected.
- Output always Turborepo monorepo. No single-package layout.
- `pnpm create @draekien/d9-app .` → scaffold into current dir; dir must be empty.
- `pnpm create @draekien/d9-app my-app` → create `./my-app`, scaffold into it.
- Create paths: `npm create`, `pnpm create`, `yarn create`, `bun create`. Package manager defaults to invoker; changeable at prompt.

## Conventions

- CLI repo built with its own stack. No tool the stack replaces.
- Conventional commits: every commit message, every PR title.

## Constraints

- CLI runs on oldest Node LTS major in maintenance + every newer major.
- CLI: no Bun/Deno-only APIs. Bun/Deno = user-selectable targets only.
- Published CLI: zero runtime dependencies. Libraries = devDependencies bundled at build. Reason: every create path downloads package each run.

## Work tracking

- Work tracked in GitHub issues: one PRD issue per feature; tracer-bullet sub-issues under it, ordered by blocked-by links.
- Milestones: `v0` (`docs/contexts/v0.md` scope), `v1`.
- Label `AFK`: agent may complete every task unsupervised. Label `HIL`: stop at each `[HIL]` task; owner completes it.
- PRD breakdowns: sub-issues only. No `.draekien/` directory.

## Contexts

- Before adding feature, tool, prompt, flag, or create path while v0 unreleased: read `docs/contexts/v0.md` (v0 scope limits).
- Before adding/changing tool choice, prompt, flag, default, or template: read `docs/contexts/scaffold-options.md`.
- Before adding dependency or changing pinned version (CLI or template): read `docs/contexts/dependency-versions.md`.

## Writing

Applies to `AGENTS.md` files and `docs/contexts/`. Every line = context paid on every turn, relevant or not.

- One rule per line, stated as rule. No preamble. No restating heading.
- Cut anything two source files teach.
- Literal only: no metaphor, no analogy. Domain vocabulary ≠ metaphor.
- Pointer to another doc names triggering task, never just directory.
- Shortest form keeping every fact: drop articles, filler verbs, full sentences. Never drop a fact.
  - ✗ `The CLI uses no Bun-only or Deno-only APIs; Bun and Deno may only be targets the user picks.`
  - ✓ `CLI: no Bun/Deno-only APIs. Bun/Deno = user-selectable targets only.`
- Current state only. No history: no "previously", "renamed from", "migrated off", "used to".

## Documentation

Agent docs live in `docs/`. Before reading/writing anything in `docs/`: read `docs/AGENTS.md`.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
