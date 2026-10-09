# create-dstack

## Purpose

A public npm `create-*` CLI that scaffolds a Turborepo monorepo on the author's preferred stack: TanStack Start, Biome, TypeScript 7, pnpm, Lefthook, Turborepo, shadcn, Tailwind, Motion. A personal project.

- Every tool is a pick-and-mix choice with alternatives offered; the stack above is the default.
- Output is always a Turborepo monorepo; there is no single-package layout.
- `pnpm create dstack .` scaffolds into the current directory, which must be empty. `pnpm create dstack my-app` creates `./my-app` and scaffolds into it.
- Works through every common create path (`npm create`, `pnpm create`, `yarn create`, `bun create`). The package manager defaults to the one that invoked the CLI and can be changed at the prompt.

## Conventions

- The CLI repo is built with its own stack; do not add a tool the stack replaces.
- Use conventional commit messages for every commit and PR title.

## Constraints

- The CLI runs on the oldest Node LTS major still in maintenance, and on every newer major.
- The CLI uses no Bun-only or Deno-only APIs; Bun and Deno may only be targets the user picks.
- The published CLI has zero runtime dependencies; libraries it uses are devDependencies bundled in at build time, because every create path downloads the package on each run.

## Contexts

- Read docs/contexts/v0.md before adding a feature, tool, prompt, flag, or create path while v0 is unreleased; it limits what v0 ships.
- Read docs/contexts/scaffold-options.md before adding or changing a tool choice, prompt, flag, default, or template.
- Read docs/contexts/dependency-versions.md before adding a dependency or changing a pinned version, in the CLI or in a template.

## Writing

Agent docs are read on every turn — every line is context each agent pays for whether or not the task touches it. One rule per line, stated as the rule. No preamble, no restating the heading. Cut anything two source files would teach. State behaviour literally: no metaphor, no analogy. The domain's own vocabulary is not a metaphor. A pointer to another document names the task that triggers the read, never the directory it points at.

In `AGENTS.md` files and `docs/contexts/`:
- Shortest form that keeps every fact: drop articles, filler verbs, full sentences; never drop a fact.
  - ✗ `The CLI uses no Bun-only or Deno-only APIs; Bun and Deno may only be targets the user picks.`
  - ✓ `CLI: no Bun/Deno-only APIs. Bun/Deno = user-selectable targets only.`
- Current state only. No history: no "previously", "renamed from", "migrated off", "used to".

## Documentation

Agent-facing documentation lives in `docs/`. Read [docs/AGENTS.md](docs/AGENTS.md) before reading or writing anything there.
