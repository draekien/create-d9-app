---
title: Working in the generated project
description: The root commands, the examples route, the git hooks, the devtools and how to add shadcn components.
order: 40
---

Run every task from the repository root. Turborepo runs it in each workspace package.

| Command | Runs |
| --- | --- |
| `pnpm dev` | `vite dev` for `apps/web` |
| `pnpm build` | `vite build` for `apps/web`, dependencies first |
| `pnpm check` | Biome lint and format check, the comment check, and every package `check` task |
| `pnpm typecheck` | `tsc --noEmit` in every package |
| `pnpm test` | `vitest run` in every package |

`apps/web` tests run in the jsdom Vitest project `unit`. `apps/web/src/setup.ts` stubs `ResizeObserver`, `matchMedia` and pointer capture, which Base UI components call and jsdom does not provide.

`pnpm dev` shows the TanStack Devtools panel with Router, Query and Form tabs. `pnpm build` removes it.

The query, form, table, hotkeys and motion examples render at `/examples` and live in `apps/web/src/routes/examples/`: the route file `route.tsx` plus the components and their tests in `-components/`. TanStack Router ignores paths prefixed with `-`. Delete that one directory to remove every example; the next `pnpm dev` or `pnpm build` regenerates `apps/web/src/routeTree.gen.ts` without the route.

The pre-commit hook runs the comment check and `biome check --write` on staged files, then re-stages what it fixed. The pre-push hook runs `pnpm typecheck` and `pnpm test`. `.gitattributes` checks every text file out with `lf` line endings.

`pnpm check` and the hook delete every `//` comment except `///`, `biome-ignore` and `@ts-` directives. Write comments only to document a public API surface.

Add shadcn components from `packages/ui`:

```sh
cd packages/ui
pnpm exec shadcn add dialog
```

Import them from the app as `@workspace/ui/components/dialog`.
