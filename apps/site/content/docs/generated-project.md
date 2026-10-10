---
title: Working in the generated project
description: The root commands, the examples route, the pre-commit hook and how to add shadcn components.
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

The query, form, table, hotkeys and motion examples render at `/examples` and live in `apps/web/src/routes/examples/`: the route file `route.tsx` plus the components and their tests in `-components/`. TanStack Router ignores paths prefixed with `-`. Delete that one directory to remove every example; the next `pnpm dev` or `pnpm build` regenerates `apps/web/src/routeTree.gen.ts` without the route.

The pre-commit hook runs the comment check and `biome check --write` on staged files, then re-stages what it fixed.

`pnpm check` and the hook delete every `//` comment except `///`, `biome-ignore` and `@ts-` directives. Write comments only to document a public API surface.

Add shadcn components from `packages/ui`:

```sh
cd packages/ui
pnpm exec shadcn add dialog
```

Import them from the app as `@workspace/ui/components/dialog`.
