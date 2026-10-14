---
title: Agent setup
description: The agent files the generated project ships, and the upgrade-dependencies and tanstack-data-loading skills.
order: 50
---

The generated project configures Claude Code and Codex. Cursor reads `.cursor/mcp.json`. Other agents that read `AGENTS.md` and `.agents/skills/` get the rules and the skills without extra setup.

| File | Purpose |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md` | Project rules: run tasks from the root, exact pins only, never edit `routeTree.gen.ts`, where tests live. |
| `.claude/rules/*.md` | Path-scoped rules for TypeScript, components, tests and generated files. Loaded only for matching files. |
| `.claude/settings.json`, `.codex/hooks.json` | `SessionStart` and `PreToolUse` hooks that run the TanStack Intent gate. |
| `.intent/hooks/` | The gate: lists the skills shipped inside the installed `@tanstack/*` packages at session start, and denies the first edit of a session until the agent has checked that list and loaded a matching skill with `pnpm exec intent load`. |
| `.agents/skills/`, `.claude/skills/` | `shadcn`, `turborepo`, `motion` and `hugeicons`, the skills each project publishes, pinned by content hash in `skills-lock.json`; `upgrade-dependencies`; and `tanstack-data-loading` unless you deselect it. |
| `.claude/agents/motion-reviewer.md` | Motion's reviewer subagent, from the same source as the `motion` skill. |
| `.mcp.json`, `.cursor/mcp.json` | MCP servers for Claude Code and Cursor: `shadcn` and `hugeicons` as pinned `npx` commands, `motion` over HTTP. Claude Code asks you to approve project servers on first use. |
| `biome.json` | GritQL plugins that enforce React, TanStack Router, TanStack Query and styling rules, such as no fetch in an effect, no inline query key, route options in inference order, and `cn()` for composed class names. |

## tanstack-data-loading

Selected by default in the integrations prompt. `--integrations` without `tanstack-data-loading`, or `--integrations none`, leaves it out.

The agent loads it when writing a route loader, `useSuspenseQuery`, `useMutation` or `createServerFn`. It covers:

- Loaders that await only the data a route cannot render without and start the rest without awaiting it, so the rest streams.
- One `useSuspenseQueries` call instead of several `useSuspenseQuery` calls, which fetch one after another.
- Mutations that write the server response with `setQueryData` and do not await invalidation, so the save is no longer pending while queries refetch.
- Server functions that do each piece of work once: one call for a list instead of one per row, and middleware that computes only what every function reads.

Ask it to audit existing code:

```text
/tanstack-data-loading audit
/tanstack-data-loading audit apps/web/src/routes/orders
```

The audit lists each finding with its file and line, applies the fixes, and runs check, typecheck and test. It reports latency changes only when they were measured.

## upgrade-dependencies

Ask the agent to upgrade dependencies. In Claude Code the skill is also a slash command:

```text
/upgrade-dependencies
/upgrade-dependencies --accept
```

The skill:

1. Finds every exact pin with a newer version that was published at least `minimumReleaseAge` ago (default 1440 minutes, the pnpm default).
2. Reads the release notes for each upgrade and shows you the breaking changes before editing anything. `--accept` skips that stop for patch and minor upgrades.
3. Applies patch and minor upgrades, runs install, build, check, typecheck and test, and reverts any package whose upgrade fails a check unless the release notes name the migration.
4. Holds every major upgrade until you confirm it, one package at a time. `--accept` never confirms a major.
5. Reports every change:

```text
| Package        | Old   | New   | Type  |
| -------------- | ----- | ----- | ----- |
| @base-ui/react | 1.8.0 | 1.9.0 | minor |

held: major
- @types/node 22.20.5 -> 26.6.4 (apps/web, packages/ui): declined
```

The skill is a single markdown file. Install the latest copy into an existing project with the [skills](https://github.com/vercel-labs/skills) CLI:

```sh
npx skills add draekien/create-d9-app --skill upgrade-dependencies
```
