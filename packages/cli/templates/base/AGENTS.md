# Project

- Turborepo monorepo managed with pnpm. Apps in `apps/`, shared packages in `packages/`.
- `apps/web`: TanStack Start on Vite, React, TypeScript, Vitest.
- Run tasks from the repo root: `pnpm build`, `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm dev`.
- Dependency versions are exact. Never use `^`, `~` or `latest`.
- Routes live in `apps/web/src/routes`. `routeTree.gen.ts` is generated; do not edit it.
