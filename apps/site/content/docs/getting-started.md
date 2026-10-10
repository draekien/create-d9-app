---
title: Getting started
description: Scaffold a Turborepo monorepo with TanStack Start, React, TypeScript, Biome, Tailwind, shadcn and pnpm, set up for AI coding agents from the first commit.
order: 10
---

Scaffolds a Turborepo monorepo with TanStack Start, React, TypeScript, Biome, Tailwind, shadcn and pnpm, set up for AI coding agents from the first commit.

```sh
pnpm create @draekien/d9-app my-app
cd my-app
pnpm dev
```

## What you get

```text
my-app/
├── apps/
│   └── web/                    TanStack Start app on Vite; `/` is a minimal page, `/examples` holds the examples
├── packages/
│   └── ui/                     shadcn components, exported as @workspace/ui
├── .agents/skills/             upgrade-dependencies skill (Codex, Cursor, Agent Skills)
├── .claude/                    rules, skills and hooks for Claude Code
├── .codex/hooks.json           hooks for Codex
├── .intent/                    TanStack Intent gate that loads skills before edits
├── AGENTS.md                   project rules for coding agents (CLAUDE.md includes it)
├── biome.json                  lint and format, plus GritQL plugins for React and TanStack rules
├── lefthook.yml                pre-commit: comment check and biome --write on staged files
├── pnpm-workspace.yaml         saveExact: true
├── turbo.json
└── package.json                packageManager: pnpm@12.11.0, engines.node >=22.18.0
```

| Concern | Tool |
| --- | --- |
| App framework | TanStack Start (Router, Query, Form, Table, Hotkeys) |
| UI | React 19 with React Compiler |
| Language | TypeScript 7 |
| Build and test | Vite, Vitest |
| Monorepo | Turborepo, pnpm workspaces |
| Lint and format | Biome |
| Git hooks | Lefthook |
| Components | shadcn on Base UI, Hugeicons |
| Styling | Tailwind 4, Motion |

Every dependency is pinned to an exact version. The project never receives an upstream release until you run the bundled [`upgrade-dependencies`](./agent-setup) skill or change a pin yourself.
