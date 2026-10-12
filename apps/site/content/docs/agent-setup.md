---
title: Agent setup
description: The agent files the generated project ships, and the upgrade-dependencies skill.
order: 50
---

The generated project configures Claude Code and Codex. Cursor reads `.cursor/mcp.json`. Other agents that read `AGENTS.md` and `.agents/skills/` get the rules and the skills without extra setup.

| File | Purpose |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md` | Project rules: run tasks from the root, exact pins only, never edit `routeTree.gen.ts`, where tests live. |
| `.claude/rules/*.md` | Path-scoped rules for TypeScript, components, tests and generated files. Loaded only for matching files. |
| `.claude/settings.json`, `.codex/hooks.json` | `SessionStart` and `PreToolUse` hooks that run the TanStack Intent gate. |
| `.intent/hooks/` | The gate: lists the skills shipped inside the installed `@tanstack/*` packages at session start, and denies the first edit of a session until the agent has checked that list and loaded a matching skill with `pnpm exec intent load`. |
| `.agents/skills/`, `.claude/skills/` | `shadcn`, `turborepo`, `motion` and `hugeicons`, the skills each project publishes, pinned by content hash in `skills-lock.json`; and `upgrade-dependencies`. |
| `.claude/agents/motion-reviewer.md` | Motion's reviewer subagent, from the same source as the `motion` skill. |
| `.mcp.json`, `.cursor/mcp.json` | MCP servers for Claude Code and Cursor: `shadcn` and `hugeicons` as pinned `npx` commands, `motion` over HTTP. Claude Code asks you to approve project servers on first use. |
| `biome.json` | GritQL plugins that enforce React, TanStack Router, TanStack Query and styling rules, such as no fetch in an effect, no inline query key, route options in inference order, and `cn()` for composed class names. |

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
