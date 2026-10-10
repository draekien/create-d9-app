# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- CLI: TypeScript 7, bundled with Rolldown into `packages/cli`, zero runtime dependencies.
- GitHub Pages site: not built yet. Decided: a prerendered (static) TanStack Start app inside this Turborepo, using the same default stack the CLI scaffolds (Tailwind, shadcn, Motion, Biome). The repo is built with its own stack; no tool the stack replaces.
- Scaffolded app: TanStack Start on Vite, React 19 with React Compiler, Tailwind 4, shadcn on Base UI, Hugeicons, Motion, in a Turborepo with pnpm workspaces.

## Users

- Primary: a developer starting a new web project who wants a working TanStack Start monorepo without assembling the tooling, usually working alongside an AI coding agent (Claude Code, Codex, or another agent that reads `AGENTS.md`).
- Their job: run one command, get a project where install, build, check, typecheck and test pass, and start writing their own code in the first minutes.
- Site visitors: developers evaluating whether to use the CLI, and existing users looking up flags, prompts, errors or generated-project commands.

## Product Purpose

`@draekien/create-d9-app` is a `create-*` CLI that scaffolds a Turborepo monorepo with a TanStack Start app, configured for AI coding agents from the first commit. Success: a developer goes from `pnpm create @draekien/d9-app my-app` to `pnpm dev` with no manual setup and no cleanup of starter content before writing their own code.

The repository also hosts a static GitHub Pages site: a landing page that presents the CLI, plus documentation carrying the reference content currently in `README.md`.

## Positioning

- Every dependency in the generated project is pinned to an exact version; nothing upgrades until the bundled `upgrade-dependencies` skill runs or the developer changes a pin.
- Agent setup ships in the generated project: `AGENTS.md`, path-scoped `.claude/rules`, the TanStack Intent gate that requires an agent to load the matching `@tanstack/*` skill before its first edit, and Biome GritQL plugins enforcing React and TanStack Query rules.
- Output is always a Turborepo monorepo (ADR 0002); templates are generated at build time from upstream tools (ADR 0003).

## Operating Context

- Invoked from a terminal: `pnpm create @draekien/d9-app my-app` or `pnpm create @draekien/d9-app .` into an empty directory.
- Interactive prompts rendered with `@clack/prompts`; every prompt has a flag; `--yes`, non-TTY stdin or `CI` runs non-interactively.
- After scaffolding the developer works from the repo root with `pnpm dev`, `pnpm build`, `pnpm check`, `pnpm typecheck`, `pnpm test`.
- The scaffolded web app is the first page the developer sees in the browser after `pnpm dev`.

## Capabilities and Constraints

- v0 create path: `pnpm create` only. `npm create`, `yarn create`, `bun create` come after v0; the package manager will default to the invoker.
- v0 scaffolds the default stack only; tool alternatives come later, and the code must allow adding them without a rewrite.
- CLI runs on the oldest Node LTS major in maintenance and every newer major; no Bun- or Deno-only APIs.
- Published CLI has zero runtime dependencies.
- Scaffolded app must stay minimal: a developer should not have to delete starter content to begin. Example code (TanStack Query, Form, Table, Hotkeys) stays in the template, isolated under one route and one folder so a single directory delete removes all of it. The home route itself carries no example content.
- Every tool combination must produce a project where install, build, lint and typecheck pass.
- Open: site URL, domain, and whether the site is versioned with the CLI.

## Brand Commitments

- Name: `create-d9-app`, published as `@draekien/create-d9-app`. Personal project of draekien.
- Voice: literal and precise, as in `README.md`: commands, file trees, tables and exact error messages over adjectives. No metaphor.
- Existing asset: `packages/cli/templates/base/apps/web/public/favicon.svg` (scaffolded app favicon). No project logo exists.

## Evidence on Hand

- `README.md`: generated file tree, tool table, prompts and flags, error table, upgrade-dependencies output sample. Primary source for site docs.
- `docs/adr/0001`–`0003`: design decisions to link from the site.
- `packages/cli/CHANGELOG.md`: release history.
- Absent, must not be fabricated: testimonials, user counts, download numbers, benchmarks, company logos, third-party endorsements.

## Product Principles

1. Time to first own line of code is the metric. Anything a developer must read past, delete or undo counts against it.
2. Show the real thing. Commands, generated trees and actual output beat descriptions, on the site and in the CLI.
3. Minimal by default, examples by choice. Starter content never sits in the paths a developer edits first.
4. Agents are first-class users of the generated project; their rules ship with it.
5. Pinned and predictable. Nothing changes under the developer without their action.
